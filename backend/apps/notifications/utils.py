from django.core.mail import send_mass_mail, send_mail
from django.conf import settings
from apps.accounts.models import User
from apps.courses.models import Course
from typing import List, Optional


def send_bulk_email(
    subject: str,
    message: str,
    recipient_list: List[str],
    html_message: Optional[str] = None,
    fail_silently: bool = False
) -> int:
    """
    Send bulk email to multiple recipients
    
    Args:
        subject: Email subject
        message: Plain text message
        recipient_list: List of email addresses
        html_message: Optional HTML message
        fail_silently: If True, exceptions will be suppressed
    
    Returns:
        Number of emails sent
    """
    if not recipient_list:
        return 0
    
    # Use send_mass_mail for better performance with many recipients
    if len(recipient_list) > 50:
        # Split into batches for mass mail
        datatuple = [
            (subject, message, settings.DEFAULT_FROM_EMAIL, [email])
            for email in recipient_list
        ]
        return send_mass_mail(datatuple, fail_silently=fail_silently)
    else:
        # Use regular send_mail for smaller lists
        sent_count = 0
        for email in recipient_list:
            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    html_message=html_message,
                    fail_silently=fail_silently
                )
                sent_count += 1
            except Exception as e:
                if not fail_silently:
                    raise e
        return sent_count


def send_course_notification(
    course: Course,
    subject: str = None,
    message: str = None,
    user_ids: Optional[List[int]] = None
) -> int:
    """
    Send email notification about a course to enrolled students
    
    Args:
        course: Course instance
        subject: Email subject (defaults to course title)
        message: Email message (defaults to course description)
        user_ids: Optional list of user IDs to send to (defaults to all enrolled students)
    
    Returns:
        Number of emails sent
    """
    if not subject:
        subject = f'Новый курс: {course.title}'
    
    if not message:
        message = f'''
Здравствуйте!

Информируем вас о новом курсе: {course.title}

{course.description or ''}

Начало курса: {course.start_date.strftime('%d.%m.%Y') if course.start_date else 'Скоро'}
Длительность: {course.duration} часов

Вы можете начать обучение в личном кабинете.

С уважением,
Команда UNICOVER
        '''.strip()
    
    # Get enrolled students
    if user_ids:
        users = User.objects.filter(id__in=user_ids, email__isnull=False).exclude(email='')
    else:
        users = course.enrolled_students.filter(email__isnull=False).exclude(email='')
    
    recipient_list = list(users.values_list('email', flat=True))
    
    if not recipient_list:
        return 0
    
    return send_bulk_email(
        subject=subject,
        message=message,
        recipient_list=recipient_list
    )


def send_course_reminder(
    course: Course,
    days_before: int = 1,
    user_ids: Optional[List[int]] = None
) -> int:
    """
    Send reminder email about upcoming course
    
    Args:
        course: Course instance
        days_before: Days before course start to send reminder
        user_ids: Optional list of user IDs to send to
    
    Returns:
        Number of emails sent
    """
    if not course.start_date:
        return 0
    
    from django.utils import timezone
    from datetime import timedelta
    
    reminder_date = course.start_date - timedelta(days=days_before)
    
    # Only send if reminder date is today or in the past (for scheduled tasks)
    if reminder_date.date() > timezone.now().date():
        return 0
    
    subject = f'Напоминание: курс "{course.title}" начинается через {days_before} дн.'
    
    message = f'''
Здравствуйте!

Напоминаем, что курс "{course.title}" начинается {course.start_date.strftime('%d.%m.%Y')}.

Не забудьте подготовиться к началу обучения!

С уважением,
Команда UNICOVER
    '''.strip()
    
    if user_ids:
        users = User.objects.filter(id__in=user_ids, email__isnull=False).exclude(email='')
    else:
        users = course.enrolled_students.filter(email__isnull=False).exclude(email='')
    
    recipient_list = list(users.values_list('email', flat=True))
    
    if not recipient_list:
        return 0
    
    return send_bulk_email(
        subject=subject,
        message=message,
        recipient_list=recipient_list
    )

