import os

base_dir = "X:/CSE470 Project/Travel Agency Management System"

for root, dirs, files in os.walk(base_dir):
    if not files and not any(f for f in os.listdir(root) if not f.startswith('.')):
        keep_file = os.path.join(root, ".keep")
        with open(keep_file, "w") as f:
            f.write("# keep")
