import os
import yaml
from pathlib import Path
from typing import Dict, Any, Optional

class PromptLoader:
    def __init__(self, prompt_dir: str = "backend/prompts"):
        self.prompt_dir = Path(prompt_dir)
        # Handle case where we are running from root or backend
        if not self.prompt_dir.exists():
            # Try absolute path based on file location
            self.prompt_dir = Path(__file__).parent.parent / "prompts"
            
    def load_prompt(self, prompt_name: str) -> Dict[str, Any]:
        """
        Loads a prompt by name. Expects a folder with prompt.md and prompt.yaml.
        Returns a dict with 'template' and metadata from yaml.
        """
        prompt_path = self.prompt_dir / prompt_name
        
        md_file = prompt_path / "prompt.md"
        yaml_file = prompt_path / "prompt.yaml"
        
        if not md_file.exists():
            raise FileNotFoundError(f"Prompt markdown not found: {md_file}")
            
        if not yaml_file.exists():
            raise FileNotFoundError(f"Prompt yaml not found: {yaml_file}")
            
        with open(md_file, "r") as f:
            template = f.read()
            
        with open(yaml_file, "r") as f:
            metadata = yaml.safe_load(f)
            
        return {
            "template": template,
            **metadata
        }
        
    def get_template(self, prompt_name: str) -> str:
        """Returns just the template string"""
        return self.load_prompt(prompt_name)["template"]

# Global instance
prompt_loader = PromptLoader()
