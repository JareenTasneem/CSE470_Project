import os

project_structure = {
    "backend": [
        "Areas/TourPackages/Controllers",
        "Areas/TourPackages/Models",
        "Areas/TourPackages/Routes",
        "Areas/TourPackages/Services",
        
        "Areas/Flights/Controllers",
        "Areas/Flights/Models",
        "Areas/Flights/Routes",
        
        "Areas/Hotels/Controllers",
        "Areas/Hotels/Models",
        "Areas/Hotels/Routes",
        
        "Areas/Payments/Models",
        "Areas/Payments/Controllers",
        "Areas/Payments/Routes",
        
        "Areas/Reviews/Models",
        "Areas/Reviews/Controllers",
        "Areas/Reviews/Routes",
        
        "Areas/Users/Models",
        "Areas/Users/Controllers",
        "Areas/Users/Routes",
        
        "Areas/Bookings/Models",
        "Areas/Bookings/Controllers",
        "Areas/Bookings/Routes",
        
        "Areas/Visa/Models",
        "Areas/Visa/Controllers",
        "Areas/Visa/Routes",
        
        "config",
        "middlewares",
        "utils"
    ],
    
    "frontend": [
        "Areas/TourPackages/Views",
        "Areas/TourPackages/Components",
        
        "Areas/Flights/Views",
        "Areas/Flights/Components",
        
        "Areas/Hotels/Views",
        "Areas/Hotels/Components",
        
        "Areas/Payments",
        "Areas/Visa",
        "Areas/Users",
        "Areas/Bookings",
        "Areas/Reviews",
        
        "Shared/Layout",
        "Shared/Auth",
        
        "assets/images",
        "assets/styles"
    ],
    
    "docs": [
        "Wireframes"
    ]
}

# 👇 Change this path to match where you want the project folders to be created
base_path = "X:\\CSE470 Project\\travel-agency-backend"

for root, folders in project_structure.items():
    for folder in folders:
        full_path = os.path.join(base_path, root, folder)
        os.makedirs(full_path, exist_ok=True)

print("✅ Full project folder structure created successfully!")
