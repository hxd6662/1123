import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.storage.database.mysql_db import get_session
from src.models.question import LearningResource

def test_resources():
    session = get_session()
    
    print("正在查询学习资源...")
    resources = session.query(LearningResource).order_by(LearningResource.created_at.desc()).limit(20).all()
    
    print(f"\n找到 {len(resources)} 个学习资源：\n")
    
    for i, res in enumerate(resources, 1):
        print(f"{i}. {res.title}")
        print(f"   科目: {res.subject}")
        print(f"   类型: {res.resource_type}")
        print(f"   难度: {res.difficulty}")
        print(f"   描述: {res.description[:50]}...")
        print()
    
    session.close()
    return resources

if __name__ == "__main__":
    test_resources()
