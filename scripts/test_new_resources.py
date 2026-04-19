import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.storage.database.mysql_db import get_session
from src.models.question import LearningResource

def test_resources():
    session = get_session()
    
    print("=== 学习资源数据验证 ===\n")
    
    all_resources = session.query(LearningResource).order_by(LearningResource.id).limit(30).all()
    
    print(f"查看前30个资源的tags：\n")
    for i, r in enumerate(all_resources, 1):
        print(f"{i}. {r.title}")
        print(f"   科目: {r.subject}")
        print(f"   Tags: {r.tags}")
        print()
    
    print(f"\n=== 总计: {session.query(LearningResource).count()} 个学习资源 ===")
    
    session.close()

if __name__ == "__main__":
    test_resources()
