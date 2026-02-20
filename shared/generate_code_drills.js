const fs = require('fs');
const path = require('path');

const tsTemplates = [
    `interface User { id: string; name: string; age?: number; }
const getUser = async (id: string): Promise<User> => {
  const res = await fetch(\`/api/users/\${id}\`);
  return res.json();
};`,
    `const items = [1, 2, 3, 4, 5];
const doubledItems = items.map(item => item * 2);
console.log(doubledItems.filter(n => n > 5));`,
    `export class Queue<T> {
  private data: T[] = [];
  push(item: T) { this.data.push(item); }
  pop(): T | undefined { return this.data.shift(); }
}`
];

const pythonTemplates = [
    `def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)`,
    `import pandas as pd

df = pd.read_csv('data.csv')
filtered_df = df[df['age'] > 30]
print(filtered_df.describe())`,
    `class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        pass`
];

const reactTemplates = [
    `import React, { useState, useEffect } from 'react';

export const Counter = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
};`,
    `useEffect(() => {
  const timer = setInterval(() => setTime(new Date()), 1000);
  return () => clearInterval(timer);
}, []);`,
    `const UserProfile = ({ user }) => (
  <div className="card">
    <h2>{user.name}</h2>
    <p>{user.email}</p>
  </div>
);`
];

const rustTemplates = [
    `fn main() {
    let mut vec = Vec::new();
    vec.push(1);
    vec.push(2);
    for x in &vec {
        println!("{}", x);
    }
}`,
    `pub struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}`,
    `use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 5);`
];

const goTemplates = [
    `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
    `type Person struct {
    Name string
    Age  int
}

func (p Person) Greet() string {
    return "Hi, I'm " + p.Name
}`,
    `func sum(nums ...int) int {
    total := 0
    for _, num := range nums {
        total += num
    }
    return total
}`
];

const cppTemplates = [
    `#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    for(int n : numbers) {
        std::cout << n << '\\n';
    }
    return 0;
}`,
    `class MyClass {
public:
    MyClass() { std::cout << "Constructed"; }
    ~MyClass() { std::cout << "Destructed"; }
};`,
    `template <typename T>
T add(T a, T b) {
    return a + b;
}`
];

const sqlTemplates = [
    `SELECT u.id, u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5;`,
    `CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50),
    salary NUMERIC(10, 2)
);`,
    `UPDATE inventory
SET stock = stock - 1
WHERE product_id = 12345 AND stock > 0;`
];

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateDrills(specialtyKey, prefix, templatesArray, count) {
    const drills = [];
    for (let i = 1; i <= count; i++) {
        const text = getRandom(templatesArray);

        // Add some random variation or unique identifiers safely
        let uniqueText = text.replace('12345', Math.floor(Math.random() * 90000) + 10000);

        let title = specialtyKey + ' Practice ' + i;

        drills.push({
            id: 'code_' + prefix + '_' + i,
            specialty: specialtyKey,
            tier: Math.random() > 0.5 ? 'INTERMEDIATE' : 'CORE',
            title: title,
            recommendedMinutes: 5,
            focusType: Math.random() > 0.5 ? 'SYNTAX' : 'ENDURANCE',
            speedTargetWpm: 50 + Math.floor(Math.random() * 20),
            content: uniqueText,
            difficulty: 'Professional',
            category: 'Code',
            description: 'Auto-generated code track drill for ' + specialtyKey + '.'
        });
    }
    return drills;
}

const allDrills = {
    typescript: generateDrills('TypeScript', 'ts', tsTemplates, 20),
    python: generateDrills('Python', 'py', pythonTemplates, 20),
    react: generateDrills('React', 'react', reactTemplates, 20),
    rust: generateDrills('Rust', 'rs', rustTemplates, 20),
    go: generateDrills('Go', 'go', goTemplates, 20),
    cpp: generateDrills('C++', 'cpp', cppTemplates, 20),
    sql: generateDrills('SQL', 'sql', sqlTemplates, 20)
};

const output = `import { Drill } from '../drillLibrary';

// Auto-generated expanded code drills
export const codeDrillPacks: Record<string, Drill[]> = ${JSON.stringify(allDrills, null, 4)};

export function getCodeDrillsBySpecialty(specialty: string): Drill[] {
    const keyMap: Record<string, string> = {
        'typescript': 'typescript',
        'python': 'python',
        'react': 'react',
        'rust': 'rust',
        'go': 'go',
        'c++': 'cpp',
        'sql': 'sql'
    };
    
    const mappedKey = keyMap[specialty.toLowerCase().replace(/\\s+/g, '')] || specialty.toLowerCase();
    return codeDrillPacks[mappedKey] || [];
}

export function getRandomCodeDrill(tier?: 'CORE' | 'INTERMEDIATE' | 'SPECIALIST', specialty?: string): Drill | null {
    let pool: Drill[] = [];

    if (specialty) {
        pool = getCodeDrillsBySpecialty(specialty);
    } else {
        Object.values(codeDrillPacks).forEach(pack => pool.push(...pack));
    }

    if (tier) {
        pool = pool.filter(d => d.tier === tier);
    }

    if (pool.length === 0) return null;

    return pool[Math.floor(Math.random() * pool.length)];
}
`;

fs.writeFileSync(path.join(__dirname, 'tracks/code.ts'), output);
console.log('Successfully generated 140 code drills in code.ts');
