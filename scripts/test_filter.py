import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.storage.database.mysql_db import get_session
from src.models.question import LearningResource

def test_filter():
    session = get_session()
    
    print("=== 测试年级筛选功能 ===\n")
    
    grades_to_test = [
        "小学一年级",
        "初中一年级",
        "高中一年级"
    ]
    
    for grade in grades_to_test:
        print(f"测试年级: {grade}")
        
        all_resources = session.query(LearningResource).order_by(LearningResource.created_at.desc()).all()
        print(f"  总资源数: {len(all_resources)}")
        
        filtered_resources = []
        for res in all_resources:
            if res.tags and grade in res.tags:
                filtered_resources.append(res)
        
        print(f"  筛选后资源数: {len(filtered_resources)}")
        
        if filtered_resources:
            print(f"  前3个资源:")
            for i, r in enumerate(filtered_resources[:3], 1):
                print(f"    {i}. {r.title} (科目: {r.subject})")
        print()
    
    session.close()

if __name__ == "__main__":
    test_filter()
