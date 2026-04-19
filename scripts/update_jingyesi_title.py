import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.storage.database.mysql_db import get_session
from src.models.question import LearningResource

def update_title():
    session = get_session()
    
    print("正在更新《静夜思》资源标题...")
    
    resource = session.query(LearningResource).filter(LearningResource.title.contains("静夜思")).first()
    
    if resource:
        resource.title = "古诗《静夜思》"
        session.commit()
        print(f"[OK] 标题已更新为: {resource.title}")
    else:
        print("未找到《静夜思》相关资源")
    
    session.close()

if __name__ == "__main__":
    update_title()
