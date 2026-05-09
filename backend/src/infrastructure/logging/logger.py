"""
Loguru configuration for VibeArchitect
"""
import sys
from loguru import logger
from pathlib import Path

# Remove default handler
logger.remove()

# Add console handler with custom format
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="DEBUG",
    colorize=True,
)

# Add file handler for all logs
log_dir = Path(__file__).parent.parent.parent.parent / "logs"
log_dir.mkdir(exist_ok=True)

logger.add(
    log_dir / "vibearchitect_{time:YYYY-MM-DD}.log",
    rotation="00:00",  # New file at midnight
    retention="7 days",  # Keep logs for 7 days
    level="DEBUG",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
)

# Add error file handler
logger.add(
    log_dir / "errors_{time:YYYY-MM-DD}.log",
    rotation="00:00",
    retention="30 days",  # Keep error logs for 30 days
    level="ERROR",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
)

__all__ = ["logger"]
