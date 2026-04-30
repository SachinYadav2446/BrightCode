# Architect Mode - Professional Diagram Guide

## Overview
The Architect mode now supports professional diagram creation including ER Diagrams, HLD (High-Level Design), LLD (Low-Level Design), and flowcharts with specialized shapes.

## New Diagram Shapes

### 🔷 Diamond (Decision Node)
**Use for:**
- Decision points in flowcharts
- Conditional logic
- Yes/No branches
- If-else statements

**Best for:** Flowcharts, Algorithm Design

### 🗄️ Cylinder (Database)
**Use for:**
- Database entities
- Data storage
- Persistent storage
- Cache systems

**Best for:** ER Diagrams, System Architecture, HLD

### ⬡ Hexagon (Process)
**Use for:**
- Processing units
- Services
- Microservices
- Business logic components

**Best for:** HLD, System Architecture, Service Diagrams

### ▱ Parallelogram (Data/Input)
**Use for:**
- Input/Output operations
- Data flow
- User input
- System output

**Best for:** Flowcharts, Data Flow Diagrams

### ⟷ Double Arrow (Relationship)
**Use for:**
- Bidirectional relationships
- Two-way communication
- Mutual dependencies
- Synchronous connections

**Best for:** ER Diagrams, Component Diagrams, Relationship Mapping

## Existing Shapes

### Basic Shapes
- **Rectangle**: Entities, Classes, Components
- **Circle**: Start/End points, States
- **Triangle**: Warnings, Alerts
- **Line**: Simple connections
- **Arrow**: Directional flow, One-way relationships

## Diagram Types You Can Create

### 1. Entity-Relationship (ER) Diagrams
**Components:**
- **Rectangles** → Entities (Tables)
- **Diamonds** → Relationships
- **Cylinders** → Databases
- **Lines/Arrows** → Connections
- **Double Arrows** → Many-to-many relationships

**Example Use Case:**
```
[User] ←→ [Orders] ←→ [Products]
   ↓
[Database]
```

### 2. High-Level Design (HLD)
**Components:**
- **Hexagons** → Services/Microservices
- **Cylinders** → Databases
- **Rectangles** → Components
- **Arrows** → Data flow
- **Double Arrows** → API calls

**Example Use Case:**
```
[Frontend] → [API Gateway] → [Auth Service]
                ↓              ↓
           [User Service]  [Database]
```

### 3. Low-Level Design (LLD)
**Components:**
- **Rectangles** → Classes
- **Diamonds** → Decision points
- **Arrows** → Method calls
- **Lines** → Associations
- **Parallelograms** → Data structures

**Example Use Case:**
```
[UserController]
      ↓
[UserService] → [UserRepository]
      ↓              ↓
[Validator]    [Database]
```

### 4. Flowcharts
**Components:**
- **Circles** → Start/End
- **Rectangles** → Process steps
- **Diamonds** → Decisions
- **Parallelograms** → Input/Output
- **Arrows** → Flow direction

**Example Use Case:**
```
(Start) → [Process] → <Decision?> → [Action] → (End)
                           ↓
                      [Alternative]
```

### 5. System Architecture
**Components:**
- **Hexagons** → Services
- **Cylinders** → Data stores
- **Rectangles** → Components
- **Double Arrows** → Communication
- **Arrows** → Dependencies

## Color Coding Best Practices

### Recommended Color Scheme:

1. **Yellow (#fbbf24)** - Primary components, Main flow
2. **Red (#ef4444)** - Critical paths, Errors, Warnings
3. **Blue (#3b82f6)** - Data flow, Databases, Storage
4. **Green (#10b981)** - Success paths, Completed states
5. **White (#ffffff)** - Labels, Annotations, Notes

## Drawing Tips

### 1. Start with Structure
- Draw main components first (rectangles, hexagons)
- Add databases and storage (cylinders)
- Connect with relationships (arrows, double arrows)
- Add decision points (diamonds)
- Label everything

### 2. Maintain Consistency
- Use same size for similar components
- Keep spacing uniform
- Align shapes properly
- Use consistent colors for similar elements

### 3. Layer Your Diagram
1. **Background Layer**: Grid lines, sections
2. **Component Layer**: Main shapes
3. **Connection Layer**: Arrows and lines
4. **Annotation Layer**: Labels and notes

### 4. Professional Layout
- **Top-to-Bottom**: For hierarchical structures
- **Left-to-Right**: For process flows
- **Circular**: For cyclic processes
- **Grid**: For matrix relationships

## Common Diagram Patterns

### ER Diagram Pattern
```
┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │←───→│  Order  │←───→│ Product │
└─────────┘     └─────────┘     └─────────┘
     │               │               │
     ↓               ↓               ↓
┌─────────────────────────────────────────┐
│            Database (Cylinder)          │
└─────────────────────────────────────────┘
```

### Microservices HLD Pattern
```
    ┌──────────┐
    │ Frontend │
    └────┬─────┘
         │
    ┌────▼─────────┐
    │ API Gateway  │
    └──┬────┬────┬─┘
       │    │    │
   ┌───▼┐ ┌─▼──┐ ┌▼────┐
   │Auth│ │User│ │Order│  (Hexagons)
   └───┬┘ └─┬──┘ └┬────┘
       │    │     │
   ┌───▼────▼─────▼───┐
   │    Database      │  (Cylinder)
   └──────────────────┘
```

### Flowchart Pattern
```
    ┌─────┐
    │Start│ (Circle)
    └──┬──┘
       │
    ┌──▼──────┐
    │ Process │ (Rectangle)
    └──┬──────┘
       │
    ┌──▼──────┐
    │Decision?│ (Diamond)
    └─┬────┬──┘
      │    │
    Yes   No
      │    │
   ┌──▼┐ ┌─▼──┐
   │Act│ │Skip│
   └──┬┘ └─┬──┘
      │    │
    ┌─▼────▼─┐
    │  End   │ (Circle)
    └────────┘
```

## Keyboard Shortcuts

- **Pen Tool**: Draw freehand
- **Eraser**: Remove mistakes
- **Shapes**: Click toolbar buttons
- **Clear Canvas**: Clear all button
- **Color**: Click color swatches
- **Size**: Use slider

## Pro Tips

1. **Plan Before Drawing**: Sketch on paper first
2. **Use Layers**: Draw background, then components, then connections
3. **Label Everything**: Add text annotations
4. **Keep It Simple**: Don't overcomplicate
5. **Use Standard Symbols**: Follow industry conventions
6. **Maintain Spacing**: Equal spacing looks professional
7. **Color Code**: Use colors meaningfully
8. **Save Snapshots**: Use Warp Drive to save versions

## Common Use Cases

### Software Architecture
- System design diagrams
- Component relationships
- Service dependencies
- Data flow diagrams

### Database Design
- ER diagrams
- Schema relationships
- Table structures
- Index strategies

### Algorithm Design
- Flowcharts
- Decision trees
- Process flows
- State machines

### Project Planning
- Workflow diagrams
- Process maps
- Dependency charts
- Timeline flows

## Best Practices

### For ER Diagrams:
- Rectangles for entities
- Diamonds for relationships
- Cylinders for databases
- Double arrows for many-to-many
- Single arrows for one-to-many

### For HLD:
- Hexagons for services
- Rectangles for components
- Cylinders for data stores
- Arrows for data flow
- Colors for different layers

### For LLD:
- Rectangles for classes
- Diamonds for decisions
- Arrows for method calls
- Parallelograms for data
- Lines for associations

### For Flowcharts:
- Circles for start/end
- Rectangles for processes
- Diamonds for decisions
- Parallelograms for I/O
- Arrows for flow

## Troubleshooting

**Shapes not drawing?**
- Make sure you selected the shape tool
- Click and drag to create shapes
- Check if you're in Architect mode

**Lines not straight?**
- Use the Line tool instead of Pen
- Draw slowly for better control
- Use Arrow tool for directional lines

**Colors not changing?**
- Click a color swatch first
- Make sure you're not in Eraser mode
- Select Pen tool after choosing color

## Future Enhancements

Coming soon:
- Text labels on shapes
- Snap-to-grid
- Shape templates
- Export as image
- Collaborative drawing
- Undo/Redo
- Copy/Paste shapes

---

**Happy Diagramming! 🎨**

Create professional diagrams for your system design, database schemas, and architectural documentation!
