import base64
import urllib.request
import urllib.parse
from typing import Tuple, Optional
from app.core.config import settings


class TwilioService:
    def __init__(self):
        self.account_sid = settings.TWILIO_ACCOUNT_SID
        self.auth_token = settings.TWILIO_AUTH_TOKEN
        self.from_number = settings.TWILIO_FROM_NUMBER
        
        # Check if all real settings are provided
        self.is_mock = not (self.account_sid and self.auth_token and self.from_number)

    def send_sms(self, to_number: str, message_body: str) -> Tuple[bool, Optional[str]]:
        """
        Sends an SMS via Twilio.
        If credentials are not configured, runs in Mock Sandbox Mode and logs the output to console.
        Returns: (success_bool, error_message_or_none)
        """
        if self.is_mock:
            self._log_mock_sms(to_number, message_body)
            return True, None
            
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"
            
            data = urllib.parse.urlencode({
                "To": to_number,
                "From": self.from_number,
                "Body": message_body
            }).encode("utf-8")
            
            req = urllib.request.Request(url, data=data, method="POST")
            
            # Add Basic Auth Header
            auth_str = f"{self.account_sid}:{self.auth_token}"
            auth_b64 = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
            req.add_header("Authorization", f"Basic {auth_b64}")
            req.add_header("Content-Type", "application/x-www-form-urlencoded")
            
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status in [200, 201]:
                    return True, None
                else:
                    return False, f"Twilio API returned status code {response.status}"
        except Exception as e:
            return False, str(e)

    def _log_mock_sms(self, to_number: str, message_body: str):
        border = "══════════════════════════════════════════════════"
        print(f"\n╔{border}╗")
        print("║ 📲 [SIMULATED SMS SENT SUCCESSFULLY via MedOS]  ║")
        print(f"╠{border}╣")
        print(f"║ 👤 TO      : {to_number:<35} ║")
        print(f"║ 🔌 FROM    : {self.from_number or '+1888MOCKSMS':<35} ║")
        print(f"╠{border}╣")
        print("║ 💬 MESSAGE :                                    ║")
        
        # Split message into lines for clean indentation and wrap safety
        for line in message_body.split("\n"):
            # Ensure lines fit within the box border nicely
            words = line.split(" ")
            current_line = ""
            for word in words:
                if len(current_line) + len(word) + 1 <= 46:
                    current_line += (word + " ")
                else:
                    print(f"║    {current_line:<44} ║")
                    current_line = word + " "
            if current_line:
                print(f"║    {current_line:<44} ║")
                
        print(f"╚{border}╝\n")


twilio_service = TwilioService()
