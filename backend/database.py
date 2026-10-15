import json
import os
from typing import Dict, List, Any
from datetime import datetime

class JSONDatabase:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        self.files = {
            'users': os.path.join(data_dir, 'users.json'),
            'posts': os.path.join(data_dir, 'posts.json'),
            'comments': os.path.join(data_dir, 'comments.json'),
            'stories': os.path.join(data_dir, 'stories.json'),
            'follows': os.path.join(data_dir, 'follows.json'),
            'likes': os.path.join(data_dir, 'likes.json'),
            'saves': os.path.join(data_dir, 'saves.json')
        }
        self._init_files()
    
    def _init_files(self):
        for file_path in self.files.values():
            if not os.path.exists(file_path):
                with open(file_path, 'w') as f:
                    json.dump([], f)
    
    def load(self, collection: str) -> List[Dict]:
        with open(self.files[collection], 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def save(self, collection: str, data: List[Dict]):
        with open(self.files[collection], 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, default=str, ensure_ascii=False)
    
    def get_next_id(self, collection: str) -> int:
        data = self.load(collection)
        return max([item.get('id', 0) for item in data], default=0) + 1

db = JSONDatabase()