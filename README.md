# Classroom Seating Chart Builder

A modern, interactive web application that empowers educators to create flexible and intelligent classroom seating arrangements with drag-and-drop functionality, advanced constraint management, and professional PDF export capabilities.

## 🎯 Project Goal

Transform the traditional classroom seating planning process into an intuitive, digital experience that saves teachers time while creating optimal learning environments. The application combines ease of use with powerful algorithms to generate seating arrangements that meet educational and social requirements.

## ✨ Key Features

### 🖱️ Interactive Desk Management
- **Drag-and-Drop Interface**: Effortlessly place and rearrange desks on a grid-based canvas
- **Multiple Desk Types**: Support for rectangular desks, round tables, and teacher desks
- **Grid Snapping**: Automatic alignment for professional-looking layouts
- **Visual Feedback**: Real-time positioning with smooth animations

### 👥 Student Management
- **Individual Entry**: Add students one by one with a simple interface
- **Bulk Import**: Copy-paste student lists from spreadsheets or documents
- **Smart Assignment**: Double-click desks to assign students directly
- **Visual Status**: Color-coded desks show assignment status at a glance

### 🎯 Advanced Constraint System
- **Hard Seat Assignments**: Lock specific students to particular desks
- **Separation Rules**: Keep certain students apart with distance requirements
- **Empty Seat Locking**: Reserve desks as intentionally empty spaces
- **Flexible Configuration**: Easy-to-use constraint builder interface

### 🧠 Intelligent Seating Algorithm
- **Constraint-Based Processing**: Automatically generates seating arrangements respecting all rules
- **Backtracking Logic**: Finds optimal solutions even with complex requirements
- **Validation System**: Ensures all constraints are satisfied before finalizing
- **Manual Override**: Teachers can always adjust algorithm results

### 📄 Professional PDF Export
- **High-Quality Output**: Crystal-clear seating charts ready for printing
- **Professional Layout**: Clean headers, footers, and timestamped generation
- **Optimized File Size**: Balanced quality and file size for easy sharing
- **Print-Ready Format**: Perfect for classroom reference or administrative records

### 💾 Data Persistence
- **Browser Local Storage**: All data stored locally in your browser (no server database required)
- **Auto-Save**: Layouts automatically saved to browser storage
- **JSON Export/Import**: Save complete classroom setups as files for backup or sharing
- **Session Recovery**: Resume work exactly where you left off
- **Reset Functionality**: Clear all data with confirmation dialog

### 📱 Responsive Design
- **Mobile-Friendly**: Works seamlessly on tablets and smartphones
- **Adaptive Interface**: Collapsible panels optimize screen space
- **Touch Support**: Full touch interaction for mobile devices
- **Cross-Platform**: Consistent experience across all devices

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe component development
- **Vite** for lightning-fast development and optimized production builds
- **Tailwind CSS** with shadcn/ui components for modern, accessible design
- **TanStack Query** for efficient server state management
- **Wouter** for lightweight client-side routing

### Backend
- **Node.js** with Express.js for robust server architecture
- **TypeScript** throughout the entire stack for consistency
- **Local Storage** for client-side data persistence (no database required)
- **RESTful API** design for clean client-server communication

### External Libraries
- **interact.js** - Powers the drag-and-drop functionality
- **html2canvas** - Converts layouts to images for PDF generation
- **jsPDF** - Creates downloadable PDF documents
- **Radix UI** - Accessible component primitives

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Development Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/classroom-seating-chart.git
cd classroom-seating-chart

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000` with hot-reload enabled.

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🐳 Docker Deployment

### Using Docker Compose
```bash
# Build and run with Docker
docker-compose up --build
```

### Manual Docker Build
```bash
# Build the image
docker build -t classroom-seating-chart .

# Run the container
docker run -p 3000:3000 classroom-seating-chart
```

### GitHub Container Registry
Pre-built images are automatically published to GHCR:
```bash
docker pull ghcr.io/yourusername/classroom-seating-chart:latest
```

## 📖 Usage Guide

### Creating Your First Seating Chart

1. **Add Students**: Use the student panel to add names individually or import a list
2. **Place Desks**: Drag desk elements from the toolbar onto the canvas
3. **Set Constraints** (Optional): Define seating rules using the constraints panel
4. **Generate Arrangement**: Click "Assign Seats" to run the seating algorithm
5. **Fine-tune**: Manually adjust assignments by double-clicking desks
6. **Export**: Generate a professional PDF for printing or sharing

### Advanced Features

- **Desk Selection**: Hold Ctrl/Cmd to select multiple desks for group operations
- **Quick Layouts**: Use preset arrangements (rows, groups, pairs) for common setups
- **Constraint Types**: Configure hard assignments, separation rules, and distance requirements
- **Save/Load**: Export your classroom layout as JSON for reuse across sessions

## 🎨 Color System

- **White**: Available/unassigned desks
- **Green**: Algorithm-assigned seats
- **Orange**: Hard constraint assignments
- **Red**: Locked empty desks
- **Blue**: Currently selected desks

## 🔧 Configuration

### Environment Variables
```bash
PORT=3000
NODE_ENV=production
```

### Data Storage
The application uses browser local storage for all data persistence. No database setup is required - everything is stored locally in the user's browser for privacy and simplicity.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies for optimal performance
- Designed with educators in mind for real-world classroom needs
- Inspired by the need for efficient classroom management tools

## 📞 Support

For questions, issues, or feature requests, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ for educators everywhere**

*This entire application was developed using Replit, demonstrating the power of cloud-based development environments for building modern web applications.*