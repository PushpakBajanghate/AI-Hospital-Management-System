import asyncio
import logging
import threading
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.notification import Notification
from app.services.twilio_service import twilio_service

logger = logging.getLogger("medos.scheduler")
_scheduler_running = False


async def poll_scheduled_notifications():
    """
    Polls the notifications table for pending notifications whose scheduled time has passed.
    Sends them and updates their status.
    """
    global _scheduler_running
    logger.info("SMS Notification Scheduler loop starting...")
    print("⏰ [MedOS Scheduler] Background SMS Reminders Poller is Active!")
    
    while _scheduler_running:
        db = SessionLocal()
        try:
            # Get current time in UTC
            now = datetime.now(timezone.utc)
            
            # Fetch pending reminders due (scheduled_time <= now)
            due_reminders = db.query(Notification).filter(
                Notification.status == "pending",
                Notification.scheduled_time <= now
            ).all()
            
            if due_reminders:
                print(f"⏰ [MedOS Scheduler] Found {len(due_reminders)} pending notifications due for delivery. Processing...")
                
            for reminder in due_reminders:
                try:
                    success, error_msg = twilio_service.send_sms(
                        to_number=reminder.phone_number,
                        message_body=reminder.message
                    )
                    
                    if success:
                        reminder.status = "sent"
                        reminder.sent_time = datetime.now(timezone.utc)
                    else:
                        reminder.status = "failed"
                        reminder.error_message = error_msg
                        
                    db.add(reminder)
                except Exception as e:
                    logger.error(f"Failed to send scheduled SMS ID {reminder.id}: {str(e)}")
                    reminder.status = "failed"
                    reminder.error_message = str(e)
                    db.add(reminder)
            
            if due_reminders:
                db.commit()
                print(f"⏰ [MedOS Scheduler] Successfully processed {len(due_reminders)} reminders.")
                
        except Exception as ex:
            logger.error(f"Error in scheduler polling loop: {str(ex)}")
        finally:
            db.close()
            
        # Poll every 15 seconds
        await asyncio.sleep(15)


def run_scheduler_in_thread(loop: asyncio.AbstractEventLoop):
    """
    Helper to run the asyncio scheduler in a separate thread if main event loop is blocked.
    """
    asyncio.set_event_loop(loop)
    loop.run_until_complete(poll_scheduled_notifications())


def start_scheduler():
    global _scheduler_running
    if _scheduler_running:
        return
        
    _scheduler_running = True
    # Run directly in FastAPI's main event loop as a background task
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(poll_scheduled_notifications())
        logger.info("Successfully registered scheduler task in running event loop.")
    except RuntimeError:
        # Fallback to separate thread if no running event loop (e.g. during script startup)
        new_loop = asyncio.new_event_loop()
        thread = threading.Thread(target=run_scheduler_in_thread, args=(new_loop,), daemon=True)
        thread.start()
        logger.info("Successfully started scheduler task in a background daemon thread.")


def stop_scheduler():
    global _scheduler_running
    _scheduler_running = False
    print("⏰ [MedOS Scheduler] Background SMS Reminders Poller has stopped.")
