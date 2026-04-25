import React from 'react';
import { 
    Code2, Zap, RefreshCw, Terminal, Cpu, Network, 
    BookOpen, Sigma, Lock, Trophy, Gamepad2, 
    Layers, Globe, Binary, Calculator, Activity
} from 'lucide-react';

// =================================================================
// --- 1. CSS ODYSSEY (50 Levels) ---
// =================================================================
export const CSS_LEVELS = [
    { id: 1, phase: 'Basics', title: 'The Blueprint', desc: 'Change the background to "indigo" and give it a "border-radius" of 10px.', reqs: [['background:indigo', 'background-color:indigo'], 'border-radius:10px'], isParent: false, base: { width: '100px', height: '100px', background: '#444' } },
    { id: 2, phase: 'Basics', title: 'Glass Circle', desc: 'Set opacity to "0.5" and border-radius to "50%".', reqs: ['opacity:0.5', 'border-radius:50%'], isParent: false, base: { width: '100px', height: '100px', background: 'white' } },
    { id: 3, phase: 'Basics', title: 'Box Modeling', desc: 'Set width to "200px" and height to "50px".', reqs: ['width:200px', 'height:50px'], isParent: false, base: { background: '#f59e0b' } },
    { id: 4, phase: 'Basics', title: 'Shadow Realm', desc: 'Give the box a box-shadow: "0 10px 20px black".', reqs: ['box-shadow:010px20pxblack'], isParent: false, base: { width: '100px', height: '100px', background: '#3b82f6' } },
    { id: 5, phase: 'Basics', title: 'Border Patrol', desc: 'Add a "5px solid white" border.', reqs: ['border:5pxsolidwhite'], isParent: false, base: { width: '100px', height: '100px', background: '#818cf8' } },
    { id: 6, phase: 'Basics', title: 'The Invisible Box', desc: 'Set the "visibility" to "hidden".', reqs: ['visibility:hidden'], isParent: false, base: { width: '100px', height: '100px', background: '#10b981' } },
    { id: 7, phase: 'Basics', title: 'Tilted', desc: 'Rotate the box by 45 degrees using the transform property.', reqs: ['transform:rotate(45deg)'], isParent: false, base: { width: '100px', height: '100px', background: '#8b5cf6' } },
    { id: 8, phase: 'Basics', title: 'Scaled Up', desc: 'Double the size using transform: "scale(2)".', reqs: ['transform:scale(2)'], isParent: false, base: { width: '50px', height: '50px', background: '#f472b6' } },
    { id: 9, phase: 'Basics', title: 'Skewed Logic', desc: 'Skew the box by -20deg on the X axis.', reqs: ['transform:skewx(-20deg)'], isParent: false, base: { width: '100px', height: '100px', background: '#06b6d4' } },
    { id: 10, phase: 'Basics', title: 'Z-Positioning', desc: 'Set z-index to "10" and position to "relative".', reqs: ['z-index:10', 'position:relative'], isParent: false, base: { width: '100px', height: '100px', background: '#fbbf24' } },
    { id: 11, phase: 'Flexbox', title: 'The Connector', desc: 'Set display to "flex" on the parent container.', reqs: ['display:flex'], isParent: true, multiBox: 2, base: { width: '50px', height: '50px', background: '#fbbf24' } },
    { id: 12, phase: 'Flexbox', title: 'Horizontal Center', desc: 'Distribute items to the center horizontally.', reqs: ['justify-content:center'], isParent: true, multiBox: 2, parentBase: { display: 'flex' }, base: { width: '50px', height: '50px', background: '#fbbf24', margin: '5px' } },
    { id: 13, phase: 'Flexbox', title: 'Vertical Alignment', desc: 'Align items to the center vertically.', reqs: ['align-items:center'], isParent: true, multiBox: 1, parentBase: { display: 'flex', height: '100%' }, base: { width: '100px', height: '100px', background: '#10b981' } },
    { id: 14, phase: 'Flexbox', title: 'Perfect Square Center', desc: 'Center items both ways.', reqs: ['justify-content:center', 'align-items:center'], isParent: true, multiBox: 1, parentBase: { display: 'flex', height: '100%' }, base: { width: '80px', height: '80px', background: '#818cf8' } },
    { id: 15, phase: 'Flexbox', title: 'The Gap', desc: 'Space the items out evenly with "space-between".', reqs: ['justify-content:space-between'], isParent: true, multiBox: 3, parentBase: { display: 'flex', width: '100%' }, base: { width: '50px', height: '50px', background: '#3b82f6' } },
    { id: 16, phase: 'Flexbox', title: 'Column Shift', desc: 'Change the flex direction to "column".', reqs: ['flex-direction:column'], isParent: true, multiBox: 3, parentBase: { display: 'flex' }, base: { width: '50px', height: '50px', background: '#8b5cf6', margin: '5px' } },
    { id: 17, phase: 'Flexbox', title: 'Reverse Column', desc: 'Backwards flow! Use "column-reverse".', reqs: ['flex-direction:column-reverse'], isParent: true, multiBox: 3, parentBase: { display: 'flex' }, base: { width: '50px', height: '50px', background: '#f472b6', margin: '2px' } },
    { id: 18, phase: 'Flexbox', title: 'Wrapped', desc: 'Allow items to "wrap" to the next line.', reqs: ['flex-wrap:wrap'], isParent: true, multiBox: 8, parentBase: { display: 'flex', width: '200px' }, base: { width: '60px', height: '60px', background: '#fbbf24', margin: '2px' } },
    { id: 19, phase: 'Flexbox', title: 'End Of Line', desc: 'Push items to the "flex-end".', reqs: ['justify-content:flex-end'], isParent: true, multiBox: 2, parentBase: { display: 'flex', width: '100%' }, base: { width: '50px', height: '50px', background: '#06b6d4' } },
    { id: 20, phase: 'Flexbox', title: 'Baseline', desc: 'Align items to the "baseline".', reqs: ['align-items:baseline'], isParent: true, multiBox: 3, parentBase: { display: 'flex', height: '100%' }, base: { width: '50px', height: '30px', background: '#fbbf24' } },
    { id: 21, phase: 'Flexbox', title: 'Evenly Spaced', desc: 'Use "space-evenly" for perfect spacing.', reqs: ['justify-content:space-evenly'], isParent: true, multiBox: 3, parentBase: { display: 'flex', width: '100%' }, base: { width: '60px', height: '60px', background: '#10b981' } },
    { id: 22, phase: 'Flexbox', title: 'Around We Go', desc: 'Use "space-around" distribution.', reqs: ['justify-content:space-around'], isParent: true, multiBox: 3, parentBase: { display: 'flex', width: '100%' }, base: { width: '60px', height: '60px', background: '#818cf8' } },
    { id: 23, phase: 'Flexbox', title: 'Content Stack', desc: 'Align wrapped content to the "center" using align-content.', reqs: ['align-content:center'], isParent: true, multiBox: 10, parentBase: { display: 'flex', flexWrap: 'wrap', height: '300px', width: '300px' }, base: { width: '50px', height: '50px', background: '#3b82f6', margin: '2px' } },
    { id: 24, phase: 'Flexbox', title: 'The Stretch', desc: 'Make boxes stretch to fill height using "stretch".', reqs: ['align-items:stretch'], isParent: true, multiBox: 3, parentBase: { display: 'flex', height: '200px' }, base: { width: '60px', background: '#8b5cf6' } },
    { id: 25, phase: 'Flexbox', title: 'Flexible Grow', desc: 'Tell the parent to "display: flex" and children to "flex-grow: 1".', reqs: ['display:flex', 'flex-grow:1'], isParent: true, multiBox: 3, parentBase: { width: '100%' }, base: { height: '80px', background: '#f472b6', border: '1px solid white' } },
    { id: 26, phase: 'Grid', title: 'The Matrix', desc: 'Initialize the grid with "display: grid".', reqs: ['display:grid'], isParent: true, multiBox: 4, base: { height: '50px', background: '#fbbf24' } },
    { id: 27, phase: 'Grid', title: 'Double Column', desc: 'Create 2 columns of 1fr each.', reqs: ['grid-template-columns:1fr1fr'], isParent: true, multiBox: 4, parentBase: { display: 'grid' }, base: { height: '50px', background: '#06b6d4' } },
    { id: 28, phase: 'Grid', title: 'The Trident', desc: 'Create 3 columns of 100px each.', reqs: ['grid-template-columns:100px100px100px'], isParent: true, multiBox: 3, parentBase: { display: 'grid' }, base: { height: '50px', background: '#fbbf24' } },
    { id: 29, phase: 'Grid', title: 'Responsive Repeat', desc: 'Use "repeat(3, 1fr)" for columns.', reqs: ['grid-template-columns:repeat(3,1fr)'], isParent: true, multiBox: 6, parentBase: { display: 'grid' }, base: { height: '50px', background: '#10b981' } },
    { id: 30, phase: 'Grid', title: 'The Gutter', desc: 'Add a "20px" gap between grid items.', reqs: ['gap:20px'], isParent: true, multiBox: 4, parentBase: { display: 'grid', gridTemplateColumns: '1fr 1fr' }, base: { height: '80px', background: '#818cf8' } },
    { id: 31, phase: 'Grid', title: 'Row Definition', desc: 'Set "grid-template-rows" to 100px.', reqs: ['grid-template-rows:100px'], isParent: true, multiBox: 2, parentBase: { display: 'grid', gridTemplateColumns: '1fr' }, base: { background: '#3b82f6' } },
    { id: 32, phase: 'Grid', title: 'Area Alignment', desc: 'Center grid items using "justify-items: center".', reqs: ['justify-items:center'], isParent: true, multiBox: 4, parentBase: { display: 'grid', gridTemplateColumns: '1fr 1fr' }, base: { width: '40px', height: '40px', background: '#8b5cf6' } },
    { id: 33, phase: 'Grid', title: 'Vertical Grid Center', desc: 'Use "align-items: center" on grid.', reqs: ['align-items:center'], isParent: true, multiBox: 4, parentBase: { display: 'grid', gridTemplateColumns: '1fr 1fr', height: '200px' }, base: { width: '40px', height: '40px', background: '#f472b6' } },
    { id: 34, phase: 'Grid', title: 'Full Grid Center', desc: 'Use "place-items: center".', reqs: ['place-items:center'], isParent: true, multiBox: 1, parentBase: { display: 'grid', height: '100%' }, base: { width: '100px', height: '100px', background: '#fbbf24' } },
    { id: 35, phase: 'Grid', title: 'Auto Fill', desc: 'Use "grid-template-columns: repeat(auto-fill, 100px)".', reqs: ['grid-template-columns:repeat(auto-fill,100px)'], isParent: true, multiBox: 5, parentBase: { display: 'grid' }, base: { height: '50px', background: '#06b6d4' } },
    { id: 36, phase: 'Grid', title: 'Max Content', desc: 'Set columns to "max-content".', reqs: ['grid-template-columns:max-content'], isParent: true, multiBox: 1, parentBase: { display: 'grid' }, renderBoxText: 'Hello World Wide Web', base: { background: '#fbbf24', padding: '10px' } },
    { id: 37, phase: 'Grid', title: 'MinMax Logic', desc: 'Use "minmax(100px, 1fr)" for a column.', reqs: ['grid-template-columns:minmax(100px,1fr)'], isParent: true, multiBox: 3, parentBase: { display: 'grid' }, base: { height: '50px', background: '#10b981' } },
    { id: 38, phase: 'Grid', title: 'Template Areas', desc: 'Define "grid-template-areas" for a header.', reqs: ['grid-template-areas:"headerheader"'], isParent: true, multiBox: 2, parentBase: { display: 'grid', gridTemplateColumns: '1fr 1fr' }, base: { height: '50px', background: '#818cf8' } },
    { id: 39, phase: 'Grid', title: 'Implicit Rows', desc: 'Set "grid-auto-rows" to 150px.', reqs: ['grid-auto-rows:150px'], isParent: true, multiBox: 4, parentBase: { display: 'grid', gridTemplateColumns: '1fr 1fr' }, base: { background: '#3b82f6' } },
    { id: 40, phase: 'Grid', title: 'Dense Flow', desc: 'Set "grid-auto-flow" to "dense".', reqs: ['grid-auto-flow:dense'], isParent: true, multiBox: 5, parentBase: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }, base: { height: '50px', background: '#8b5cf6' } },
    { id: 41, phase: 'Advanced', title: 'Hero Section', desc: 'Create a centered "Hero" box using flex with "column" direction.', reqs: ['display:flex', 'flex-direction:column', 'justify-content:center', 'align-items:center'], isParent: true, multiBox: 2, parentBase: { height: '100%', background: '#111' }, base: { padding: '20px', background: '#fbbf24', margin: '5px' } },
    { id: 42, phase: 'Advanced', title: 'Card Layout', desc: 'Use "display: grid" with "gap: 20px" and "grid-template-columns: repeat(3, 1fr)".', reqs: ['display:grid', 'gap:20px', 'grid-template-columns:repeat(3,1fr)'], isParent: true, multiBox: 6, parentBase: { padding: '20px' }, base: { height: '100px', background: '#06b6d4', borderRadius: '12px' } },
    { id: 43, phase: 'Advanced', title: 'Sticky Bar', desc: 'Set "position: sticky" and "top: 0".', reqs: ['position:sticky', 'top:0'], isParent: false, base: { width: '100%', height: '50px', background: '#f59e0b', zIndex: '100' } },
    { id: 44, phase: 'Advanced', title: 'Circle Avatar Grid', desc: 'Grid with 4 columns, items must be "border-radius: 50%".', reqs: ['display:grid', 'grid-template-columns:repeat(4,1fr)', 'border-radius:50%'], isParent: true, multiBox: 4, base: { width: '60px', height: '60px', background: '#818cf8' } },
    { id: 45, phase: 'Advanced', title: 'Holy Grail Grid', desc: 'Setup columns: "150px 1fr 150px".', reqs: ['grid-template-columns:150px1fr150px'], isParent: true, multiBox: 3, parentBase: { display: 'grid', height: '100%' }, base: { background: '#3b82f6', border: '1px solid white' } },
    { id: 46, phase: 'Advanced', title: 'Profile Header', desc: 'Use flex with "align-items: center" and "gap: 15px".', reqs: ['display:flex', 'align-items:center', 'gap:15px'], isParent: true, multiBox: 2, base: { background: '#8b5cf6', padding: '10px' } },
    { id: 47, phase: 'Advanced', title: 'Modern Button', desc: 'Add "padding: 12px 24px", "cursor: pointer", and "transition: 0.3s".', reqs: ['padding:12px24px', 'cursor:pointer', 'transition:0.3s'], isParent: false, base: { background: '#fbbf24', border: 'none', borderRadius: '8px' } },
    { id: 48, phase: 'Advanced', title: 'Dark Mode Card', desc: 'Background "#1c1917", color "white", border "1px solid #333".', reqs: [['background:#1c1917', 'background-color:#1c1917'], 'color:white', 'border:1pxsolid#333'], isParent: false, base: { padding: '20px', borderRadius: '16px' } },
    { id: 49, phase: 'Advanced', title: 'The Ultimate Navbar', desc: 'Flex, space-between, fixed position at the top.', reqs: ['display:flex', 'justify-content:space-between', 'position:fixed', 'top:0'], isParent: true, isNavbarMock: true, parentBase: { width: '100%', height: '60px', background: '#333' } },
    { id: 50, phase: 'Advanced', title: 'The Grand Finale', desc: 'Create a 12-column grid using "repeat(12, 1fr)".', reqs: ['display:grid', 'grid-template-columns:repeat(12,1fr)'], isParent: true, multiBox: 12, parentBase: { width: '100%', gap: '5px' }, base: { height: '100px', background: 'linear-gradient(to bottom, #fbbf24, #d97706)' } }
];

// =================================================================
// --- 2. LOGIC LAB (100 Levels) ---
// =================================================================
export const LOGIC_LEVELS = [
    { id: 1, phase: 'LogicBasics', title: 'The Adder', desc: 'Return sum of a and b.', testCases: [[1,2,3], [10,20,30]], params: 'a, b' },
    { id: 2, phase: 'LogicBasics', title: 'True or False', desc: 'Return true if a > 10.', testCases: [[5, false], [15, true]], params: 'a' },
    { id: 3, phase: 'LogicBasics', title: 'String Flip', desc: 'Reverse the string str.', testCases: [['cat','tac'],['ai','ia']], params: 'str' },
    { id: 4, phase: 'LogicBasics', title: 'Power Level', desc: 'Return a raised to power of b.', testCases: [[2,3,8], [5,2,25]], params: 'a, b' },
    { id: 5, phase: 'LogicBasics', title: 'Odd One Out', desc: 'Return true if n is odd.', testCases: [[3, true], [4, false]], params: 'n' },
    { id: 6, phase: 'LogicBasics', title: 'Greetings', desc: 'Return "Hello " joined with name.', testCases: [['Alex','Hello Alex']], params: 'name' },
    { id: 7, phase: 'LogicBasics', title: 'Absolute Unit', desc: 'Return absolute value of n.', testCases: [[-5,5], [10,10]], params: 'n' },
    { id: 8, phase: 'LogicBasics', title: 'Remainder', desc: 'Return remainder of a divided by b.', testCases: [[10,3,1], [7,2,1]], params: 'a, b' },
    { id: 9, phase: 'LogicBasics', title: 'Type Checker', desc: 'Return the typeof val.', testCases: [[5,'number'], ['hi','string'], [true,'boolean']], params: 'val' },
    { id: 10, phase: 'LogicBasics', title: 'Foundational End', desc: 'Return a + b + c.', testCases: [[1,1,1,3]], params: 'a,b,c' },
    { id: 11, phase: 'ControlFlow', title: 'Max of Two', desc: 'If a > b return a, else b.', testCases: [[1,5,5], [10,2,10]], params: 'a, b' },
    { id: 12, phase: 'ControlFlow', title: 'Teenager Check', desc: 'Return true if age is 13 to 19.', testCases: [[15, true], [20, false], [12, false]], params: 'age' },
    { id: 13, phase: 'ControlFlow', title: 'Fizz Buzz Mini', desc: 'Return "fizz" if n%3==0, else "buzz".', testCases: [[3,'fizz'], [5,'buzz']], params: 'n' },
    { id: 14, phase: 'ControlFlow', title: 'Null Shield', desc: 'Return val if not null, else return "Empty".', testCases: [[null,'Empty'], [5,5]], params: 'val' },
    { id: 15, phase: 'ControlFlow', title: 'Smallest Of Three', desc: 'Return the smallest of a, b, and c.', testCases: [[1,2,3,1], [10,5,20,5]], params: 'a,b,c' },
    { id: 16, phase: 'ControlFlow', title: 'Positive Only', desc: 'Return n if positive, else 0.', testCases: [[5,5], [-10,0]], params: 'n' },
    { id: 17, phase: 'ControlFlow', title: 'Score Grader', desc: 'Return "A" if s>=90, "B" if s>=80, else "F".', testCases: [[95,'A'], [85,'B'], [70,'F']], params: 's' },
    { id: 18, phase: 'ControlFlow', title: 'Leap Year Check', desc: 'Return true if y is divisible by 4.', testCases: [[2024, true], [2023, false]], params: 'y' },
    { id: 19, phase: 'ControlFlow', title: 'Vowel Check', desc: 'Return true if char c is a,e,i,o,u.', testCases: [['a',true], ['z',false]], params: 'c' },
    { id: 20, phase: 'ControlFlow', title: 'Weekend? ', desc: 'Return true if day is saturday or sunday.', testCases: [['saturday',true], ['monday',false]], params: 'd' },
    { id: 21, phase: 'ControlFlow', title: 'Speed Limit', desc: 'Return "Fine" if s>100, else "Safe".', testCases: [[110,'Fine'], [90,'Safe']], params: 's' },
    { id: 22, phase: 'ControlFlow', title: 'Password Length', desc: 'True if p.length >= 8.', testCases: [['pass',false], ['password',true]], params: 'p' },
    { id: 23, phase: 'ControlFlow', title: 'Between Matrix', desc: 'True if n is between 100-200.', testCases: [[150,true], [50,false]], params: 'n' },
    { id: 24, phase: 'ControlFlow', title: 'Sign Solver', desc: 'Return 1 if pos, -1 if neg, 0 if 0.', testCases: [[5,1], [-5,-1], [0,0]], params: 'n' },
    { id: 25, phase: 'ControlFlow', title: 'Control Master', desc: 'True if both a and b are positive.', testCases: [[1,1,true], [-1,1,false]], params: 'a,b' },
    { id: 26, phase: 'Loops', title: 'The Looper', desc: 'Return the sum of all numbers from 1 to n.', testCases: [[3,6], [5,15]], params: 'n' },
    { id: 27, phase: 'Loops', title: 'Array Sum', desc: 'Sum all numbers in arr.', testCases: [[[1,2],3], [[5,5,5],15]], params: 'arr' },
    { id: 28, phase: 'Loops', title: 'Evens Array', desc: 'Return an array of even numbers from 1 to n.', testCases: [[5,[2,4]], [2,[2]]], params: 'n' },
    { id: 29, phase: 'Loops', title: 'The Repeater', desc: 'Return string s repeated n times.', testCases: [['hi',2,'hihi']], params: 's,n' },
    { id: 30, phase: 'Loops', title: 'Factorial', desc: 'Return n factorial.', testCases: [[3,6], [4,24]], params: 'n' },
    { id: 31, phase: 'Loops', title: 'Count Vowels', desc: 'Count vowels in string s.', testCases: [['hello',2], ['xyz',0]], params: 's' },
    { id: 32, phase: 'Loops', title: 'Search Item', desc: 'Return index of target in arr, else -1.', testCases: [[[1,2], 2, 1], [[1], 0, -1]], params: 'arr,t' },
    { id: 33, phase: 'Loops', title: 'Max Finder', desc: 'Return largest number in arr.', testCases: [[[1,5,3],5]], params: 'arr' },
    { id: 34, phase: 'Loops', title: 'Min Finder', desc: 'Return smallest number in arr.', testCases: [[[5,1,10],1]], params: 'arr' },
    { id: 35, phase: 'Loops', title: 'Odd Filter', desc: 'Return array with only odd numbers.', testCases: [[[1,2,3],[1,3]]], params: 'arr' },
    { id: 36, phase: 'Loops', title: 'Average', desc: 'Return average of numbers in arr.', testCases: [[[10,20],15]], params: 'arr' },
    { id: 37, phase: 'Loops', title: 'Space Count', desc: 'Count spaces in string s.', testCases: [['hi there', 1]], params: 's' },
    { id: 38, phase: 'Loops', title: 'Palindrome', desc: 'True if s is same backwards.', testCases: [['aba',true], ['abc',false]], params: 's' },
    { id: 39, phase: 'Loops', title: 'Double Array', desc: 'Return arr with every value doubled.', testCases: [[[1,2],[2,4]]], params: 'arr' },
    { id: 40, phase: 'Loops', title: 'Prime Check', desc: 'True if n is prime.', testCases: [[7,true], [4,false]], params: 'n' },
    { id: 41, phase: 'Loops', title: 'Fibonacci n', desc: 'Return nth fibonacci number.', testCases: [[5,5], [3,2]], params: 'n' },
    { id: 42, phase: 'Loops', title: 'Remove Duplicates', desc: 'Return array without dupes.', testCases: [[[1,1,2],[1,2]]], params: 'arr' },
    { id: 43, phase: 'Loops', title: 'Join Custom', desc: 'Join arr items with char c.', testCases: [[['a','b'],'-','a-b']], params: 'arr,c' },
    { id: 44, phase: 'Loops', title: 'Flatten Matrix', desc: 'Flatten a 2D array [ [1],[2] ].', testCases: [[[[1],[2]], [1,2]]], params: 'arr' },
    { id: 45, phase: 'Loops', title: 'Master Looper', desc: 'Return product of non-zero items in arr.', testCases: [[[1,2,0,3], 6]], params: 'arr' },
    { id: 46, phase: 'Data', title: 'Object Creator', desc: 'Return { name, age }.', testCases: [['Alex',20, {name:'Alex',age:20}]], params: 'name,age' },
    { id: 47, phase: 'Data', title: 'Key Extractor', desc: 'Return keys of object obj.', testCases: [[{a:1,b:2}, ['a','b']]], params: 'obj' },
    { id: 48, phase: 'Data', title: 'Value Collector', desc: 'Return values of object obj.', testCases: [[{a:1,b:2}, [1,2]]], params: 'obj' },
    { id: 49, phase: 'Data', title: 'Merge Objects', desc: 'Combine obj1 and obj2.', testCases: [[{a:1},{b:2},{a:1,b:2}]], params: 'o1,o2' },
    { id: 50, phase: 'Data', title: 'Pick Key', desc: 'Return value of obj[key].', testCases: [[{a:5},'a',5]], params: 'obj, k' },
    { id: 51, phase: 'Data', title: 'Add Tax', desc: 'Add "tax: true" to obj.', testCases: [[{id:1},{id:1,tax:true}]], params: 'obj' },
    { id: 52, phase: 'Data', title: 'Delete Key', desc: 'Delete "pass" from obj.', testCases: [[{u:'a',pass:'1'},{u:'a'}]], params: 'obj' },
    { id: 53, phase: 'Data', title: 'Length Of Array', desc: 'Return len of arr.', testCases: [[[1,2],2]], params: 'arr' },
    { id: 54, phase: 'Data', title: 'First Three', desc: 'Return first 3 items of arr.', testCases: [[[1,2,3,4],[1,2,3]]], params: 'arr' },
    { id: 55, phase: 'Data', title: 'Last Item', desc: 'Return last item of arr.', testCases: [[[1,2,3],3]], params: 'arr' },
    { id: 56, phase: 'Data', title: 'Slice & Dice', desc: 'Return arr slice from i to j.', testCases: [[[1,2,3,4],1,3,[2,3]]], params: 'arr,i,j' },
    { id: 57, phase: 'Data', title: 'Includes T', desc: 'Return true if arr includes t.', testCases: [[[1,2],1,true]], params: 'arr,t' },
    { id: 58, phase: 'Data', title: 'Object Count', desc: 'Return count of keys in obj.', testCases: [[{a:1,b:2},2]], params: 'obj' },
    { id: 59, phase: 'Data', title: 'Age Limit', desc: 'Return array of objects where age > 18.', testCases: [[[{age:20},{age:10}],[{age:20}]]], params: 'arr' },
    { id: 60, phase: 'Data', title: 'Map Names', desc: 'Return array of names from objects.', testCases: [[[{name:'A'},{name:'B'}],['A','B']]], params: 'arr' },
    { id: 61, phase: 'Data', title: 'Find ID', desc: 'Return object with id == x.', testCases: [[[{id:1},{id:2}],2,{id:2}]], params: 'arr,x' },
    { id: 62, phase: 'Data', title: 'Sort Numbers', desc: 'Return arr sorted ascending.', testCases: [[[3,1,2],[1,2,3]]], params: 'arr' },
    { id: 63, phase: 'Data', title: 'JSON Stringify', desc: 'Return JSON string of data.', testCases: [[{a:1},'{"a":1}']], params: 'd' },
    { id: 64, phase: 'Data', title: 'JSON Parse', desc: 'Return object from JSON s.', testCases: [['{"a":1}',{a:1}]], params: 's' },
    { id: 65, phase: 'Data', title: 'Nested Access', desc: 'Return obj.data.val.', testCases: [[{data:{val:5}},5]], params: 'obj' },
    { id: 66, phase: 'Data', title: 'Swap Keys', desc: 'Return { b: a_val, a: b_val }.', testCases: [[{a:1,b:2},{a:2,b:1}]], params: 'obj' },
    { id: 67, phase: 'Data', title: 'Clear Nulls', desc: 'Return arr without null items.', testCases: [[[1,null,2],[1,2]]], params: 'arr' },
    { id: 68, phase: 'Data', title: 'Total Wealth', desc: 'Sum "balance" across objects.', testCases: [[[{balance:10},{balance:20}],30]], params: 'arr' },
    { id: 69, phase: 'Data', title: 'Object Identity', desc: 'Return id of object.', testCases: [[{id:123},123]], params: 'obj' },
    { id: 70, phase: 'Data', title: 'Data Master', desc: 'Return true if obj has at least 5 keys.', testCases: [[{a:1,b:2,c:3,d:4,e:5},true]], params: 'obj' },
    { id: 71, phase: 'Functional', title: 'Square Map', desc: 'Use .map() to square numbers in arr.', testCases: [[[2,3],[4,9]]], params: 'arr' },
    { id: 72, phase: 'Functional', title: 'Filter Odd', desc: 'Use .filter() for odds.', testCases: [[[1,2,3],[1,3]]], params: 'arr' },
    { id: 73, phase: 'Functional', title: 'Sum Reduce', desc: 'Use .reduce() for total sum.', testCases: [[[1,2,3],6]], params: 'arr' },
    { id: 74, phase: 'Functional', title: 'Every Positive', desc: 'True if every item > 0.', testCases: [[[1,2],true], [[-1],false]], params: 'arr' },
    { id: 75, phase: 'Functional', title: 'Some Negative', desc: 'True if some item < 0.', testCases: [[[1,-1],true], [[1],false]], params: 'arr' },
    { id: 76, phase: 'Functional', title: 'Find First Max', desc: 'Find first item > x.', testCases: [[[1,10,2],5,10]], params: 'arr,x' },
    { id: 77, phase: 'Functional', title: 'Callback Run', desc: 'Invoke callback cb then return "Done".', testCases: [[()=>{},'Done']], params: 'cb' },
    { id: 78, phase: 'Functional', title: 'Double Tap', desc: 'Invoke f(f(val)).', testCases: [[(x)=>x*2,2,8]], params: 'f,val' },
    { id: 79, phase: 'Functional', title: 'Curry Addition', desc: 'Return a function that adds "a" to its input.', testCases: [[5, (x)=>x+5]], params: 'a' },
    { id: 80, phase: 'Functional', title: 'Compose Basic', desc: 'Return f(g(x)).', testCases: [[(x)=>x+1, (x)=>x*2, 5, 11]], params: 'f,g,x' },
    { id: 81, phase: 'Functional', title: 'Delay Execution', desc: 'Return "Async" after running cb.', testCases: [[()=>{},'Async']], params: 'cb' },
    { id: 82, phase: 'Functional', title: 'Pipe Two', desc: 'Return g(f(x)).', testCases: [[(x)=>x+1, (x)=>x*2, 5, 12]], params: 'f,g,x' },
    { id: 83, phase: 'Functional', title: 'Memoize Add', desc: 'Return cached result if input same.', testCases: [[5,10]], params: 'n' },
    { id: 84, phase: 'Functional', title: 'Closure Count', desc: 'Return function that increments a private counter.', testCases: [[1]], params: 'init' },
    { id: 85, phase: 'Functional', title: 'Bind Context', desc: 'Return obj.getName bound to obj.', testCases: [[{name:'A',getName:function(){return this.name}},'A']], params: 'obj' },
    { id: 86, phase: 'Functional', title: 'Recursion Power', desc: 'Factorial using recursion.', testCases: [[5,120]], params: 'n' },
    { id: 87, phase: 'Functional', title: 'Pure Function', desc: 'Return a+b without side effects.', testCases: [[1,1,2]], params: 'a,b' },
    { id: 88, phase: 'Functional', title: 'Partial App', desc: 'Return f bound with first arg a.', testCases: [[(x,y)=>x+y, 10, (y)=>10+y]], params: 'f,a' },
    { id: 89, phase: 'Functional', title: 'Immutable Update', desc: 'Return new obj with key k updated.', testCases: [[{a:1},'a',2,{a:2}]], params: 'obj,k,v' },
    { id: 90, phase: 'Functional', title: 'Array To Object', desc: 'Reduce [[k,v]] to {k:v}.', testCases: [[[['a',1]], {a:1}]], params: 'arr' },
    { id: 91, phase: 'Functional', title: 'Zip Arrays', desc: 'Combine [a1,a2] and [b1,b2] to [[a1,b1]].', testCases: [[[1],[2],[[1,2]]]], params: 'a,b' },
    { id: 92, phase: 'Functional', title: 'Unzip Data', desc: 'Reverse of Zip.', testCases: [[[[1,2]],[[1],[2]]]], params: 'arr' },
    { id: 93, phase: 'Functional', title: 'Validate Obj', desc: 'Check if keys exist in schema.', testCases: [[{id:1},['id'],true]], params: 'obj,s' },
    { id: 94, phase: 'Functional', title: 'Safe Access', desc: 'Return val?.[k] or "Nope".', testCases: [[null,'a','Nope']], params: 'obj,k' },
    { id: 95, phase: 'Functional', title: 'Wait Timeout', desc: 'Call resolve after ms.', testCases: [[100,'Done']], params: 'ms' },
    { id: 96, phase: 'Functional', title: 'Retry Logic', desc: 'Retry f n times.', testCases: [[(x)=>x,3,true]], params: 'f,n' },
    { id: 97, phase: 'Functional', title: 'Debounce Mock', desc: 'Return debounced f.', testCases: [[(x)=>x, 100]], params: 'f,ms' },
    { id: 98, phase: 'Functional', title: 'Throttle Mock', desc: 'Return throttled f.', testCases: [[(x)=>x, 100]], params: 'f,ms' },
    { id: 99, phase: 'Functional', title: 'Promise Wrap', desc: 'Wrap val in Promise.', testCases: [[5]], params: 'val' },
    { id: 100, phase: 'Functional', title: 'Ultimate Logic Master', desc: 'The Forge is yours. Return "Master".', testCases: [[1,'Master']], params: 'godMode' }
];

// =================================================================
// --- 3. REACT QUEST (30 Levels) ---
// =================================================================
export const REACT_LEVELS = [
    { id: 1, phase: 'Fundamentals', title: 'JSX Basics', question: 'What does JSX stand for?', options: ['JavaScript XML', 'JavaScript Extension', 'Java Syntax Extension', 'JSON XML'], answer: 0 },
    { id: 2, phase: 'Fundamentals', title: 'The Root', question: 'Which method renders a React app into the DOM?', options: ['React.render()', 'ReactDOM.render()', 'createRoot().render()', 'Both B and C'], answer: 3 },
    { id: 3, phase: 'Fundamentals', title: 'Components', question: 'What is a React component?', options: ['A CSS class', 'A reusable piece of UI', 'An HTML page', 'A database model'], answer: 1 },
    { id: 4, phase: 'Fundamentals', title: 'Props', question: 'Props in React are...', options: ['Mutable state', 'Read-only data passed from parent to child', 'Global variables', 'CSS properties'], answer: 1 },
    { id: 5, phase: 'Fundamentals', title: 'State', question: 'Which hook is used to add local state to a functional component?', options: ['useEffect', 'useContext', 'useState', 'useReducer'], answer: 2 },
    { id: 6, phase: 'Fundamentals', title: 'Keys', question: 'Why do we need "key" props in lists?', options: ['For CSS targeting', 'To help React identify which items changed', 'For accessibility', 'None of the above'], answer: 1 },
    { id: 7, phase: 'Fundamentals', title: 'Fragments', question: 'What does <></> do in JSX?', options: ['Creates a div', 'Is a syntax error', 'Wraps children without adding extra DOM nodes', 'Renders nothing'], answer: 2 },
    { id: 8, phase: 'Fundamentals', title: 'Events', question: 'How do you handle a click event in React?', options: ['onclick="fn()"', 'onClick={fn}', 'on-click={fn}', 'addEventListener("click", fn)'], answer: 1 },
    { id: 9, phase: 'Fundamentals', title: 'Conditional Render', question: 'Which operator is commonly used for conditional rendering?', options: ['&& operator', 'Ternary operator', 'Both A and B', 'Switch statement'], answer: 2 },
    { id: 10, phase: 'Fundamentals', title: 'Default Props', question: 'defaultProps is used to...', options: ['Define prop types', 'Set default values for props when not provided', 'Make props required', 'Clone props'], answer: 1 },
    { id: 11, phase: 'Hooks', title: 'useEffect', question: 'When does useEffect run by default?', options: ['Only on mount', 'Only on unmount', 'After every render', 'Before render'], answer: 2 },
    { id: 12, phase: 'Hooks', title: 'Dependency Array', question: 'What does an empty [] in useEffect mean?', options: ['Run on every render', 'Run only once on mount', 'Never run', 'Run on unmount only'], answer: 1 },
    { id: 13, phase: 'Hooks', title: 'useRef', question: 'useRef is used to...', options: ['Manage state', 'Access DOM elements directly or persist values without re-render', 'Create context', 'Fetch data'], answer: 1 },
    { id: 14, phase: 'Hooks', title: 'useMemo', question: 'useMemo is used to...', options: ['Cache expensive computations', 'Memoize functions', 'Fetch APIs', 'Create refs'], answer: 0 },
    { id: 15, phase: 'Hooks', title: 'useCallback', question: 'useCallback returns a memoized...', options: ['Value', 'Component', 'Function', 'Effect'], answer: 2 },
    { id: 16, phase: 'Hooks', title: 'useContext', question: 'useContext is used to...', options: ['Create a context', 'Consume a context value', 'Update context', 'Delete context'], answer: 1 },
    { id: 17, phase: 'Hooks', title: 'useReducer', question: 'useReducer is an alternative to useState for...', options: ['Simple state', 'Complex state logic', 'Async state', 'Global state'], answer: 1 },
    { id: 18, phase: 'Hooks', title: 'Rules of Hooks', question: 'Where can you call hooks?', options: ['Inside loops', 'Inside conditions', 'Only at top level of functional components', 'Inside class methods'], answer: 2 },
    { id: 19, phase: 'Hooks', title: 'Custom Hooks', question: 'A custom hook must start with...', options: ['hook', 'use', 'custom', 'react'], answer: 1 },
    { id: 20, phase: 'Hooks', title: 'Cleanup', question: 'How do you clean up a useEffect?', options: ['Return a function from the effect', 'Call clearEffect()', 'Use useCleanup()', 'None'], answer: 0 },
    { id: 21, phase: 'Advanced', title: 'Lifting State', question: 'Lifting state up means...', options: ['Moving state to a parent component', 'Using Redux', 'Moving state to a server', 'Using context'], answer: 0 },
    { id: 22, phase: 'Advanced', title: 'Context API', question: 'React Context is primarily used for...', options: ['Prop drilling', 'Avoiding prop drilling', 'HTTP requests', 'DOM manipulation'], answer: 1 },
    { id: 23, phase: 'Advanced', title: 'React.memo', question: 'React.memo prevents re-renders when...', options: ['State changes', 'Props have not changed', 'Context changes', 'Always'], answer: 1 },
    { id: 24, phase: 'Advanced', title: 'Lazy Loading', question: 'React.lazy() is used for...', options: ['Delaying component rendering', 'Code splitting / lazy loading components', 'Suspense fallback', 'Creating animations'], answer: 1 },
    { id: 25, phase: 'Advanced', title: 'Suspense', question: '<Suspense> is used with...', options: ['React.lazy()', 'useEffect', 'useState', 'useRef'], answer: 0 },
    { id: 26, phase: 'Advanced', title: 'Error Boundaries', question: 'Error boundaries catch errors in...', options: ['Event handlers', 'Async code', 'Child component trees', 'API calls'], answer: 2 },
    { id: 27, phase: 'Advanced', title: 'Portals', question: 'ReactDOM.createPortal renders a component...', options: ['In place', 'Outside its parent DOM node', 'Invisibly', 'In a shadow DOM'], answer: 1 },
    { id: 28, phase: 'Advanced', title: 'Reconciliation', question: 'React reconciliation is the process of...', options: ['Styling components', 'Diffing old and new virtual DOM to update real DOM efficiently', 'Mounting components', 'Fetching data'], answer: 1 },
    { id: 29, phase: 'Advanced', title: 'Controlled Inputs', question: 'A controlled input in React means...', options: ['Input managed by the DOM', 'Input value is driven by React state', 'Input without onChange', 'Read-only input'], answer: 1 },
    { id: 30, phase: 'Advanced', title: 'React Master', question: 'Which feature allows React 18 to pause rendering work?', options: ['Concurrent Mode', 'Strict Mode', 'Suspense Mode', 'Portal Mode'], answer: 0 },
];

// =================================================================
// --- 4. SUBJECT MAPPINGS ---
// =================================================================
export const SUBJECT_PHASES = {
    'css-odyssey': [
        { name: 'Basics', start: 0, end: 9, label: 'Section 1: Foundations' },
        { name: 'Flexbox', start: 10, end: 24, label: 'Section 2: Flexbox Mastery' },
        { name: 'Grid', start: 25, end: 39, label: 'Section 3: Grid Architecture' },
        { name: 'Advanced', start: 40, end: 49, label: 'Section 4: Advanced Systems' }
    ],
    'logic-lab': [
        { name: 'LogicBasics', start: 0, end: 9, label: 'Section 1: Foundations' },
        { name: 'ControlFlow', start: 10, end: 24, label: 'Section 2: Decision Matrix' },
        { name: 'Loops', start: 25, end: 44, label: 'Section 3: Iterative Logic' },
        { name: 'Data', start: 45, end: 69, label: 'Section 4: Data Architect' },
        { name: 'Functional', start: 70, end: 99, label: 'Section 5: Final Logic Suite' }
    ],
    'react-quest': [
        { name: 'Fundamentals', start: 0, end: 9, label: 'Section 1: Basic Patterns' },
        { name: 'Hooks', start: 10, end: 19, label: 'Section 2: Hooks Deep-Dive' },
        { name: 'Advanced', start: 20, end: 29, label: 'Section 3: Architect Patterns' }
    ]
};

// =================================================================
// --- 5. PHASE THEORY CONTENT ---
// =================================================================
export const PHASE_THEORIES = {
    // --- CSS ---
    'Basics': { title: 'CSS Foundations', icon: React.createElement(Code2, { size: 40, color: "#f59e0b" }), content: ['CSS controls visual styles.', 'The Box Model includes Padding, Margin, and Border.', 'Selectors target HTML elements specifically.'] },
    'Flexbox': { title: 'Flexbox Engine', icon: React.createElement(Zap, { size: 40, color: "#10b981" }), content: ['1D Layout logic for rows or columns.', 'Main Axis and Cross Axis alignment control.', 'Flex-grow allows items to fill space.'] },
    'Grid': { title: 'Grid Matrix', icon: React.createElement(Layers, { size: 40, color: "#8b5cf6" }), content: ['2D Layout system with rows and columns.', 'Fractional units (fr) for responsive sizing.', 'Grid areas allow template-based designs.'] },
    'Advanced': { title: 'Modern UI Patterns', icon: React.createElement(Trophy, { size: 40, color: "#f59e0b" }), content: ['Complex component composition.', 'Responsive design across all viewpoints.', 'Fixed positioning and z-index layers.'] },

    // --- Logic ---
    'LogicBasics': { title: 'Logic Foundations', icon: React.createElement(Binary, { size: 40, color: "#06b6d4" }), content: ['Variables store data states.', 'Arithmetic operators change values.', 'String manipulation basics.'] },
    'ControlFlow': { title: 'Decision Matrix', icon: React.createElement(RefreshCw, { size: 40, color: "#8b5cf6" }), content: ['If/Else branches create logic paths.', 'Ternary operators for concise logic.', 'Comparison operators like === and >.'] },
    'Loops': { title: 'Cycle Supremacy', icon: React.createElement(RefreshCw, { size: 40, color: "#06b6d4" }), content: ['For and While loops repeat logic.', 'Iteration over arrays and strings.', 'Breaking and continuing loop flows.'] },
    'Data': { title: 'Data Architect', icon: React.createElement(BookOpen, { size: 40, color: "#10b981" }), content: ['Objects store keyed information.', 'Arrays are indexed collections.', 'JSON parsing and stringifying data.'] },
    'Functional': { title: 'Functional Forge', icon: React.createElement(Zap, { size: 40, color: "#fbbf24" }), content: ['Higher-order functions like map/filter.', 'Closures and private scope logic.', 'Asynchronous promises and callbacks.'] },

    // --- React ---
    'Fundamentals': { title: 'React Core', icon: React.createElement(Code2, { size: 40, color: "#818cf8" }), content: ['JSX syntax and Component logic.', 'Props for one-way data flow.', 'The Virtual DOM reconciliation process.'] },
    'Hooks': { title: 'Hooks Engine', icon: React.createElement(Zap, { size: 40, color: "#818cf8" }), content: ['useState for local state management.', 'useEffect for side-effect handling.', 'useMemo and useCallback for efficiency.'] },
    'Advanced': { title: 'Architect Patterns', icon: React.createElement(Layers, { size: 40, color: "#818cf8" }), content: ['Context API for global state.', 'Lazy loading and Code splitting.', 'Error Boundaries and Suspense.'] }
};

// =================================================================
// --- 6. GLOBAL QUOTES ---
// =================================================================
export const ALL_QUOTES = {
    'css-odyssey': ["Design is not what it feels like, but how it works.", "CSS is the paintbrush of the web."],
    'logic-lab': ["Logic is the anatomy of thought.", "Clear code is its own reward."],
    'react-quest': ["React makes UI development painless.", "Master the tree, master the view."]
};
