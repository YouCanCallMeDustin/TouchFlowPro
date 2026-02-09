export const codeSnippets = [
    {
        id: 'js-1',
        title: 'JavaScript: Array Filter',
        language: 'javascript',
        difficulty: 'Intermediate',
        content: `const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens);`
    },
    {
        id: 'py-1',
        title: 'Python: List Comprehension',
        language: 'python',
        difficulty: 'Intermediate',
        content: `squares = [x**2 for x in range(10)]
evens = [x for x in squares if x % 2 == 0]
print(evens)`
    },
    {
        id: 'react-1',
        title: 'React: Functional Component',
        language: 'typescript',
        difficulty: 'Professional',
        content: `import React, { useState } from 'react';

export const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
};`
    },
    {
        id: 'css-1',
        title: 'CSS: Flexbox Center',
        language: 'css',
        difficulty: 'Beginner',
        content: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}`
    }
];
