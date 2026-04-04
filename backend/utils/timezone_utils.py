from datetime import datetime
import pytz

def get_local_time():
    """Returns the current time in East African Time (EAT)."""
    tz = pytz.timezone('Africa/Nairobi')
    return datetime.now(tz).replace(tzinfo=None)

def to_local_date(dt):
    """Converts a datetime object to EAT date."""
    if dt is None:
        return None
    # If dt is naive, assume it's UTC and convert (though we plan to store EAT naive)
    # However, if we store EAT naive, we just return dt.date()
    return dt.date()
