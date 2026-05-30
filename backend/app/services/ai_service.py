import json
import urllib.request
import urllib.parse
from typing import List, Dict, Any, Tuple
from app.core.config import settings


class AIService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.OPENAI_MODEL
        # Check if real API key is provided
        self.is_mock = not self.api_key

    def generate_recommendations(self, patient_profile: Dict[str, Any], clinical_context: Dict[str, Any]) -> Tuple[List[str], str]:
        """
        Generates tailored dietary, lifestyle, and clinical health suggestions.
        If OpenAI API key is not configured, falls back to a smart EMR sandbox heuristic engine.
        Returns: (suggestions_list, clinical_summary)
        """
        if self.is_mock:
            return self._generate_mock_recommendations(patient_profile, clinical_context)
            
        try:
            url = "https://api.openai.com/v1/chat/completions"
            
            system_prompt = (
                "You are an expert AI clinical health assistant designed to assist registered medical doctors. "
                "Your job is to analyze a patient's EMR profile (age, gender, blood group, allergies, chronic history) "
                "along with their new clinical presentation (current symptoms, diagnosis, and prescribed medicines) "
                "and generate 3 to 5 highly structured, direct, action-oriented suggestions (such as 'reduce sugar intake', "
                "'avoid salty foods', 'increase hydration to 3L daily'). "
                "You must also write a short clinical summary explanation (2-3 sentences) detailing the clinical rationale "
                "behind your suggestions based on their allergies, history, or symptoms. "
                "IMPORTANT: The suggestions are to assist the doctor; doctors make the final clinical decisions. "
                "Return your response ONLY as a valid JSON object with EXACTLY two keys: "
                "\"summary\": (string: clinical rationale summary) and \"suggestions\": (array of strings: the action-oriented instructions). "
                "Do not include any markdown backticks, markdown code blocks, or extra text."
            )
            
            user_content = {
                "patient": {
                    "name": patient_profile.get("name"),
                    "age": patient_profile.get("age"),
                    "gender": patient_profile.get("gender"),
                    "blood_group": patient_profile.get("blood_group"),
                    "allergies": patient_profile.get("allergies"),
                    "disease_history": patient_profile.get("disease_history")
                },
                "clinical_visit": {
                    "symptoms": clinical_context.get("symptoms"),
                    "diagnosis": clinical_context.get("diagnosis"),
                    "prescribed_medicines": clinical_context.get("medicines"),
                    "instructions": clinical_context.get("instructions")
                }
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": json.dumps(user_content)}
                ],
                "temperature": 0.3
            }
            
            data = json.dumps(payload).encode("utf-8")
            
            req = urllib.request.Request(url, data=data, method="POST")
            req.add_header("Authorization", f"Bearer {self.api_key}")
            req.add_header("Content-Type", "application/json")
            
            with urllib.request.urlopen(req, timeout=12) as response:
                if response.status in [200, 201]:
                    res_body = json.loads(response.read().decode("utf-8"))
                    content_str = res_body["choices"][0]["message"]["content"].strip()
                    
                    # Strip potential markdown code block wrappers
                    if content_str.startswith("```"):
                        lines = content_str.split("\n")
                        if lines[0].startswith("```json"):
                            content_str = "\n".join(lines[1:-1])
                        else:
                            content_str = "\n".join(lines[1:-1])
                            
                    parsed_ai = json.loads(content_str)
                    suggestions = parsed_ai.get("suggestions", [])
                    summary = parsed_ai.get("summary", "AI recommendations successfully formulated.")
                    return suggestions, summary
                else:
                    print(f"⚠️ [AI Service] OpenAI API returned status code {response.status}. Falling back to sandbox engine.")
                    return self._generate_mock_recommendations(patient_profile, clinical_context)
        except Exception as e:
            print(f"⚠️ [AI Service] OpenAI API error: {str(e)}. Gracefully falling back to EMR sandbox engine.")
            return self._generate_mock_recommendations(patient_profile, clinical_context)

    def _generate_mock_recommendations(self, patient_profile: Dict[str, Any], clinical_context: Dict[str, Any]) -> Tuple[List[str], str]:
        """
        EMR Sandbox Heuristic Engine - generates highly personalized suggestions locally.
        """
        suggestions = []
        name = patient_profile.get("name", "Patient")
        age = patient_profile.get("age", 30)
        gender = patient_profile.get("gender", "Male")
        allergies = (patient_profile.get("allergies") or "").lower()
        history = (patient_profile.get("disease_history") or "").lower()
        
        symptoms = clinical_context.get("symptoms", "").lower()
        diagnosis = clinical_context.get("diagnosis", "").lower()
        medicines = clinical_context.get("medicines", "").lower()
        
        print("\n" + "═"*50)
        print(" 🧠 [MedOS AI Clinical Assistant] RUNNING IN LOCAL SANDBOX HEURISTIC ENGINE")
        print(f"  PATIENT : {name} | AGE: {age} | ALLERGIES: {allergies or 'none'}")
        print(f"  DIAGNOSIS: {diagnosis or 'none'}")
        print("═"*50 + "\n")
        
        # 1. Allergy-based triggers
        if allergies and allergies != "none":
            for allergy in allergies.split(","):
                allergy = allergy.strip()
                if allergy:
                    suggestions.append(f"Strictly avoid food, medicines, or products containing {allergy} (severe allergy risk)")

        # 2. Disease History / Diagnosis triggers
        # Diabetes Check
        if "diab" in history or "diab" in diagnosis or "sugar" in diagnosis:
            suggestions.append("reduce sugar intake and prefer complex low-glycemic foods")
            suggestions.append("avoid refined pastries, sodas, and processed carbohydrates")
            suggestions.append("monitor blood glucose levels twice daily (fasting and 2h post-prandial)")
            
        # Hypertension Check
        if "hyperten" in history or "hyperten" in diagnosis or "blood pressure" in diagnosis or " bp" in diagnosis:
            suggestions.append("avoid salty foods and restrict sodium intake to under 1,500 mg daily")
            suggestions.append("monitor blood pressure daily and record in personal clinical log")
            suggestions.append("engage in 30 minutes of daily low-impact cardiovascular activity (e.g. brisk walking)")
            
        # Renal/Kidney Check
        if "kidney" in history or "kidney" in diagnosis or "renal" in diagnosis or "nephro" in diagnosis:
            suggestions.append("strictly limit intake of high-potassium foods (bananas, spinach) and protein load")
            suggestions.append("monitor daily fluid intake and output logs as directed by nephrology specialists")
            
        # Hydration & Rest Check (Fever, flu, vomiting, etc.)
        fever_terms = ["fever", "cold", "flu", "cough", "vomit", "diarrh", "dehydr", "infect"]
        if any(term in symptoms or term in diagnosis for term in fever_terms):
            suggestions.append("increase hydration by drinking at least 3 to 4 liters of clean water daily")
            suggestions.append("supplement with oral rehydration salts (ORS) to maintain mineral balance")
            suggestions.append("ensure absolute physical bed rest and avoid strenuous activities for 72 hours")

        # 3. Geriatric/Age triggers
        if age >= 60:
            suggestions.append("ensure adequate daily intake of calcium and Vitamin D3 supplements")
            suggestions.append("engage in light stretching or joint-flexibility exercise routines")

        # 4. Fallbacks to ensure 3-5 suggestions
        if len(suggestions) < 3:
            suggestions.append("ensure balanced dietary nutrition rich in fresh leafy vegetables and lean proteins")
        if len(suggestions) < 3:
            suggestions.append("ensure consistent restful sleep of 7 to 8 hours daily for optimal cellular recovery")
        if len(suggestions) < 3:
            suggestions.append("avoid tobacco consumption and strictly limit intake of alcoholic beverages")
            
        # Cap suggestions to 5 items maximum
        suggestions = list(dict.fromkeys(suggestions))[:5]
        
        # Build rationale summary
        history_str = f"chronic history of {history}" if history else "no reported chronic history"
        allergy_str = f"known allergies to {allergies}" if allergies else "no known drug or food allergies"
        
        summary = (
            f"AI clinical analysis formulated for {name} ({age}y, {gender}). Suggestion vectors prioritized "
            f"due to {allergy_str} and {history_str}. Attending physician should evaluate these lifestyle, dietary, "
            f"and hydration recommendations against the final treatment plan. Final medical choices remain the doctor's responsibility."
        )
        
        return suggestions, summary


ai_service = AIService()
