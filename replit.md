# ALiza Store E-commerce Platform

## Overview

ALiza Store is a modern e-commerce platform for fashion and lifestyle products. It's built as a static web application using vanilla HTML, CSS, and JavaScript with a focus on responsive design and user experience. The platform features a complete shopping experience including product browsing, cart management, checkout functionality, and a dynamic dark/light theme system.

## System Architecture

### Frontend Architecture
- **Static Site**: Built with vanilla HTML5, CSS3, and JavaScript
- **Responsive Design**: Uses Bootstrap 5 and Tailwind CSS for responsive layouts
- **Component Structure**: Modular HTML pages with shared navigation and styling
- **Icon System**: Font Awesome for consistent iconography
- **Local Storage**: Browser localStorage for cart persistence

### Technology Stack
- HTML5 for structure
- CSS3 with custom CSS variables and theme system
- Vanilla JavaScript for interactivity and theme management
- Bootstrap 5 for responsive components
- Tailwind CSS for utility-first styling
- Font Awesome for icons
- Python HTTP server for local development

### Theme System
- **Dual Theme Support**: Light and dark mode with seamless switching
- **ALiza Store Brand Colors**: Purple (#8B5CF6) primary, amber (#F59E0B) secondary, pink (#EC4899) accent
- **Theme Persistence**: User preferences saved in localStorage
- **Dynamic UI Updates**: All components adapt to theme changes in real-time

## Key Components

### Pages
- **index.html**: Homepage with hero section and featured products
- **products.html**: Product listing with filtering and search
- **product-detail.html**: Individual product details and purchase options
- **cart.html**: Shopping cart management
- **checkout.html**: Order completion and payment

### Product Categories
- **Hand Bags**: Luxury leather totes, crossbody bags, backpack purses, evening clutches, shoulder bags, and bucket bags
- **Beauty Products**: Face serums, lipstick sets, night creams, eyeshadow palettes, cleansers, and mascara/eyeliner duos
- **Kid Toys**: Educational building blocks, plush teddy bears, learning tablets, wooden puzzles, remote control cars, and art & craft sets
- **Clothes**: Cotton t-shirts, denim jackets, dress shirts, jeans, silk blouses, and cardigan sweaters

### JavaScript Modules
- **main.js**: Core application logic and product management
- **cart.js**: Shopping cart functionality and localStorage operations
- **products.js**: Product filtering, sorting, and pagination

### Data Layer
- **products.json**: Static product database with complete product information
- **localStorage**: Client-side cart, user preferences, and theme storage (alizastore_* keys)

### Styling
- **style.css**: Custom CSS with CSS variables, animations, and component styles
- Hybrid approach using both Bootstrap and Tailwind for flexibility

## Data Flow

1. **Product Loading**: Products loaded from JSON file on page initialization
2. **User Interactions**: Event-driven architecture for user actions
3. **Cart Management**: Items stored in localStorage with real-time updates
4. **State Persistence**: Shopping cart and user preferences persist across sessions
5. **Responsive Updates**: UI updates dynamically based on user actions

## External Dependencies

### CDN Resources
- Bootstrap 5.3.0 for responsive components
- Tailwind CSS for utility classes
- Font Awesome 6.4.0 for icons

### Development Server
- Python HTTP server for local development (port 5000)
- No external APIs or backend services required

## Deployment Strategy

### Current Setup
- Static file serving via Python HTTP server
- All assets served from local filesystem
- No build process required

### Scalability Considerations
- Ready for CDN deployment
- Can be hosted on any static hosting service
- Product data can be migrated to REST API when needed
- localStorage can be replaced with user accounts and database

### Development Workflow
- Direct file editing with live reload via HTTP server
- No transpilation or build steps required
- Easy local development setup

## Changelog

```
Changelog:
- June 22, 2025: Initial setup
- June 22, 2025: Rebranded to ALiza Store with dark/light theme system
- June 22, 2025: Added 4 main product categories with custom SVG images and reorganized product catalog
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

### Architecture Notes

The application follows a **static-first approach** with client-side state management. This provides:

**Advantages:**
- Fast loading times
- No server dependencies
- Easy deployment
- Simple development workflow

**Considerations for Future Enhancement:**
- Product data could be moved to a database when the catalog grows
- User authentication system could be added
- Payment processing integration needed for real transactions
- SEO optimization may require server-side rendering

The current architecture prioritizes simplicity and rapid development while maintaining the flexibility to evolve into a more complex system as needed.