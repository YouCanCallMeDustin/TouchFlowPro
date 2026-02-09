export interface Drill {
    id: string;
    title: string;
    content: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Professional' | 'Specialist';
    category: string;
    description: string;
    theory?: string; // Tactical typing advice
    focusKeys?: string[]; // Specific keys targeted in this drill
    warmupSteps?: { text: string; insight: string }[]; // Sequential calibration steps
    practiceVariations?: string[]; // Optional array of practice texts
}

export const drillLibrary: Drill[] = [
    // CODING DRILLS
    {
        id: 'c1',
        title: 'HTML Structure',
        content: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title></head><body><main class="container"><h1>Hello World</h1><p>This is a paragraph.</p></main></body></html>',
        difficulty: 'Intermediate',
        category: 'Coding',
        description: 'Practice standard HTML5 boilerplate code with common meta tags and structure.',
        theory: 'HTML uses angle brackets and closing tags. precise typing of < and > is essential for the DOM.',
        focusKeys: ['<', '>', '/', '!', '"', '='],
        warmupSteps: [
            { text: '<> </> < >', insight: 'Opening and closing tag rhythm.' },
            { text: 'html head body', insight: 'Standard document structure tags.' },
            { text: 'meta charset utf-8', insight: 'Attribute syntax calibration.' },
            { text: '<title>Document</title>', insight: 'Nested tag flow.' },
            { text: '<!DOCTYPE html>', insight: 'Declaration speed burst.' }
        ],
        practiceVariations: [
            '<html><body><header><nav><ul><li>Link</li></ul></nav></header><main><h1>Title</h1></main><footer>Footer</footer></body></html>',
            '<div class="card"><img src="thumb.jpg" alt="Thumbnail"><div class="content"><h3>Card Title</h3><p>Description text goes here.</p></div></div>',
            '<form action="/submit" method="POST"><label for="email">Email</label><input type="email" id="email" required><button type="submit">Signup</button></form>',
            '<table border="1"><thead><tr><th>ID</th><th>Name</th></tr></thead><tbody><tr><td>1</td><td>John</td></tr></tbody></table>',
            '<section id="hero"><div class="hero-content"><h1>Welcome</h1><a href="#about" class="btn">Learn More</a></div></section>'
        ]
    },
    {
        id: 'c2',
        title: 'SQL Queries',
        content: 'SELECT u.id, u.name, u.email, o.total FROM users u JOIN orders o ON u.id = o.user_id WHERE u.active = 1 AND o.created_at >= "2024-01-01" ORDER BY o.total DESC LIMIT 50;',
        difficulty: 'Intermediate',
        category: 'Coding',
        description: 'Write complex SQL database commands with joins and filters.',
        theory: 'SQL keywords are often typed in ALL CAPS. Use the Shift key efficiently.',
        focusKeys: ['S', 'E', 'L', 'C', 'T', '*', 'F', 'R', 'O', 'M', 'W', 'H', 'A', 'G'],
        warmupSteps: [
            { text: 'SELECT FROM WHERE', insight: 'The core SQL command clause.' },
            { text: 'INSERT INTO VALUES', insight: 'Data creation commands.' },
            { text: 'UPDATE SET WHERE', insight: 'Data modification commands.' },
            { text: 'DELETE FROM TABLE', insight: 'Destructive command caution.' },
            { text: 'ORDER BY DESC LIMIT', insight: 'Sorting and filtering clauses.' }
        ],
        practiceVariations: [
            'SELECT p.name, c.category_name, COUNT(s.id) as sales FROM products p LEFT JOIN categories c ON p.cat_id = c.id JOIN sales s ON p.id = s.prod_id GROUP BY p.name;',
            'INSERT INTO users (username, email, password_hash, created_at) VALUES ("jdoe", "john@example.com", "hash123", NOW()), ("asmith", "alice@example.com", "hash456", NOW());',
            'UPDATE employees SET salary = salary * 1.05, last_raise = NOW() WHERE department_id = 10 AND performance_score > 4.5 AND years_of_service >= 2;',
            'DELETE FROM sessions WHERE last_activity < DATE_SUB(NOW(), INTERVAL 30 DAY) AND is_active = 0 AND keep_alive = 0;',
            'CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, email VARCHAR(100) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);'
        ]
    },
    {
        id: 'c3',
        title: 'Python Functions',
        content: 'def calculate_total_price(base_price, tax_rate, discount=0):\n    """Calculates final price with tax and discount"""\n    tax_amount = base_price * tax_rate\n    subtotal = base_price + tax_amount\n    return subtotal - discount',
        difficulty: 'Intermediate',
        category: 'Coding',
        description: 'Type clean, indented Python code with docstrings.',
        theory: 'Python relies on indentation. Maintain rhythm with the Tab key (or 4 spaces).',
        focusKeys: ['d', 'e', 'f', '(', ')', ':', '_', 'r', 't', 'u', 'n', '+', '*'],
        warmupSteps: [
            { text: 'def return class import', insight: 'Python keyword essentials.' },
            { text: 'self init args kwargs', insight: 'Object-oriented parameters.' },
            { text: 'if elif else while for', insight: 'Control flow structures.' },
            { text: 'try except finally raise', insight: 'Error handling blocks.' },
            { text: 'print(f"Result: {value}")', insight: 'F-string formatting.' }
        ],
        practiceVariations: [
            'def get_user_data(user_id):\n    try:\n        user = db.query(User).get(user_id)\n        return user.to_dict() if user else None\n    except Exception as e:\n        log_error(e)\n        return None',
            'class Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n    def area(self):\n        return self.width * self.height',
            'list_numbers = [1, 2, 3, 4, 5]\nsquared_numbers = [x ** 2 for x in list_numbers if x % 2 == 0]\nprint(f"Squared evens: {squared_numbers}")',
            'import os\nfrom datetime import datetime\n\ndef log_message(msg):\n    timestamp = datetime.now().isoformat()\n    print(f"[{timestamp}] {msg}")',
            'with open("data.csv", "r") as f:\n    lines = f.readlines()\n    headers = lines[0].strip().split(",")\n    data = [line.strip().split(",") for line in lines[1:]]'
        ]
    },

    // FOCUS DRILLS
    {
        id: 'x1',
        title: 'Difficult Words',
        content: 'The phenomenon of pareidolia causes people to interpret random stimuli as meaningful shapes. It is why we see faces in clouds or figures on the moon. This psychological effect is a byproduct of how our brains process visual information. We are hardwired to recognize patterns even where none exist. It is a fascinating quirk of human perception.',
        difficulty: 'Professional',
        category: 'Focus',
        description: 'Practice words that are notoriously hard to spell and type.',
        theory: 'Slow down. Read the word "pareidolia" fully before committing your fingers.',
        focusKeys: ['p', 'h', 'e', 'n', 'o', 'm', 'r', 'i', 'd', 'l', 'a'],
        warmupSteps: [
            { text: 'phenom phenomenon', insight: 'Greek root rhythm.' },
            { text: 'pareid pareidolia', insight: 'Complex vowel sequence.' },
            { text: 'interp interpret', insight: 'Standard prefix flow.' },
            { text: 'stimu stimuli', insight: 'Latin plural ending.' },
            { text: 'meaning meaningful', insight: 'Suffix attachment.' }
        ],
        practiceVariations: [
            'The anesthetist administered the medication effectively.',
            'The bureaucracy required unnecessary documentation.',
            'The colonel commanded the lieutenant to reconnaissance.',
            'The rhythm of the algorithm was unpredictable.',
            'The queue required patience and perseverance.'
        ]
    },
    {
        id: 'x2',
        title: 'Number Patterns',
        content: '1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393. The Fibonacci sequence appears in nature, from the arrangement of leaves on a stem to the spiral of a nautilus shell. It represents the golden ratio of growth.',
        difficulty: 'Intermediate',
        category: 'Focus',
        description: 'Type the Fibonacci sequence.',
        theory: 'Pure number entry using commas and spaces as separators. Maintain a steady beat.',
        focusKeys: ['1', '2', '3', '4', '5', '8', '9', ',', ' '],
        warmupSteps: [
            { text: '1 2 3 5 8', insight: 'Basic single digits.' },
            { text: '13 21 34 55', insight: 'Double digit transitions.' },
            { text: '89 144 233', insight: 'Crossing the 100 threshold.' },
            { text: '1, 2, 3,', insight: 'Comma-space rhythm.' },
            { text: '144 233 377', insight: 'Complex triple digits.' }
        ],
        practiceVariations: [
            '2, 4, 8, 16, 32, 64, 128, 256, 512, 1024',
            '3, 9, 27, 81, 243, 729, 2187, 6561',
            '10, 20, 30, 40, 50, 60, 70, 80, 90, 100',
            '100, 99, 98, 97, 96, 95, 94, 93, 92, 91',
            '2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31'
        ]
    },

    // BEGINNER DRILLS (10)

    {
        id: 'b1',
        title: 'Home Row Foundation',
        content: 'sad lad fad dad had jag lag sag hag fall hall. all lads had a sad dad. a fad had a jag. a lad had a flag. sad dads had lads. a hag had a bag. fall hall wall ball call. half a hall is tall. all dads fall taking a call. sad lads had a ball.',
        difficulty: 'Beginner',
        category: 'Fundamentals',
        description: 'Master the home row keys where your fingers naturally rest.',
        theory: 'The home row is your base of operations. Your fingers should always return here. Keep your index fingers on the keys with the small bumps (F and J).',
        focusKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
        warmupSteps: [
            { text: 'asdf fdsa a s d f f d s a', insight: 'Left hand check. These are your anchors for the left side.' },
            { text: 'jkl; ;lkj j k l ; ; l k j', insight: 'Right hand check. Fingers J, K, L, and Punctuation are your right side anchors.' },
            { text: 'f j f j ff jj fjf jfj', insight: 'The "Homing" keys. These have the small physical bumps to help you find center without looking.' },
            { text: 'sad lad fad dad glass alas', insight: 'Combining home row keys into simple familiar patterns.' },
            { text: 'fall hall shall flask salads', insight: 'Testing double-taps and cross-hand movement while staying local to home.' }
        ],
        practiceVariations: [
            'lad sad dad fad had jag lag fall hall sag hag',
            'fall hall sad lad fad jag lag sag hag dad had',
            'dad had sad lad fad hall fall jag lag sag hag',
            'jag lag sag hag fall hall sad lad fad dad had',
            'had dad fad lad sad hag sag lag jag hall fall',
            'hall fall lag jag sag hag had dad fad lad sad',
            'sad fad lad dad had fall hall jag lag sag hag',
            'lag sag jag hag hall fall had dad fad lad sad',
            'fad sad lad had dad sag lag jag hag fall hall',
            'hag sag lag jag fall hall fad sad lad dad had',
            'alas a flask a salad a sash a small hall',
            'glass flask salads sashes flasks small shall',
            'dad sad lad alas a salad fall hall small',
            'jag lag sag hag a flask small sash glass',
            'fad had dad sad lad shall fall hall small',
            'a salad a flask a sash a hall fall shall',
            'sag hag jag lag a small glass flask sash',
            'sad dad lad fad had shall fall hall alas',
            'glass sashes salads flasks a small salad shall',
            'fall hall small sash glass flask salads sashes'
        ]
    },
    {
        id: 'b2',
        title: 'Common Letter Pairs',
        content: 'The cat sat on the mat. The dog ran to the park. He and she are in the car. It is an on and off thing. The man and the pan. To be or not to be. He ran to the van. She sat on the hat. The rat ran in the vat. It is interesting to see the inner tea.',
        difficulty: 'Beginner',
        category: 'Bigrams',
        description: 'Practice the most frequent two-letter combinations in English.',
        theory: 'Bigrams like "th", "he", and "in" are the building blocks of most English words. Mastering these pairs creates a fluid typing rhythm.',
        focusKeys: ['t', 'h', 'e', 'm', 'a', 'n', 'r', 'p'],
        warmupSteps: [
            { text: 'th he th he the the then then', insight: 'The most common bigrams in English. Master these for an immediate speed boost.' },
            { text: 'in er in er inner inner enter enter', insight: 'Vowel-consonant pairs that appear in thousands of words.' },
            { text: 'the mat the mat them mat hat', insight: 'Connecting bigrams into tiny words. Focus on the transition between letters.' },
            { text: 'cat dog cat dog can net get', insight: 'Establishing a comfortable rhythm between left and right hand actions.' },
            { text: 'park ran park ran part mark near', insight: 'Practicing outer-finger reaches (p, r) from the home row base.' }
        ],
        practiceVariations: [
            'The dog sat on the mat. The cat ran to the park.',
            'The mat sat on the cat. The park ran to the dog.',
            'The park ran to the mat. The cat sat on the dog.',
            'The dog ran to the cat. The mat sat on the park.',
            'The cat ran to the mat. The dog sat on the park.',
            'The park sat on the dog. The mat ran to the cat.',
            'The mat ran to the dog. The cat sat on the park.',
            'The dog sat on the park. The cat ran to the mat.',
            'The cat sat on the park. The dog ran to the mat.',
            'The mat sat on the dog. The park ran to the cat.',
            'The man had a hat. The rat sat on the pan.',
            'A cat and a dog. A pen and a map in a car.',
            'She ran to the park. He sat on the mat today.',
            'The hat is on the mat. The cat is in the car.',
            'He had a pan and a map. She had a cat and a dog.',
            'The rat and the cat. The dog and the man ran.',
            'A park in the sun. A mat on the hat in the car.',
            'The car is in the park. The man is on the mat.',
            'She and he ran to the car. The cat sat on it.',
            'The dog and the rat ran. The mat is in the pan.'
        ]
    },
    {
        id: 'b3',
        title: 'Top Row Basics',
        content: 'Type your report. Write your query. Update your profile. Pretty purple peppers. Top row power output. Try to type true. Your poor tour is over. Quietly quit the quote. Put up your popup. We were where we were. You wrote your output prior to the report.',
        difficulty: 'Beginner',
        category: 'Fundamentals',
        description: 'Build confidence with the top row of the keyboard.',
        theory: 'The top row contains some of the most used letters (QWERTY). Reach up with your fingers but keep your palms steady and return to the home row immediately.',
        focusKeys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        warmupSteps: [
            { text: 'qwer ui op qwer ui op power power', insight: 'Exploring the outer reaches of the top row.' },
            { text: 'type write type write writer writer', insight: 'Words that live almost entirely on the top row. Keep your wrists quiet.' },
            { text: 'rt yu rt yu true true jury jury', insight: 'Practicing the index finger reaches for the central top row keys.' },
            { text: 'query update query update unit unit', insight: 'Moving between home row and top row. Always snap back to home.' },
            { text: 'report profile report profile prior', insight: 'Developing precision on the top row while maintaining hand position.' }
        ],
        practiceVariations: [
            'Write your profile. Type your query. Update your report.',
            'Update your query. Write your report. Type your profile.',
            'Type your profile. Update your query. Write your report.',
            'Write your report. Update your profile. Type your query.',
            'Update your profile. Type your report. Write your query.',
            'Type your query. Write your profile. Update your report.',
            'Write your query. Type your profile. Update your report.',
            'Update your report. Write your query. Type your profile.',
            'Type your report. Update your profile. Write your query.',
            'Write your profile. Update your report. Type your query.',
            'Power up your output. Prepare your prior report.',
            'Quote your query. Quietly quit the top row now.',
            'Pretty purple peppers. Pure power top row output.',
            'Try to type true. Your poor tour is quiet now.',
            'We were where we were. You wrote your prior output.',
            'Update your profile prior to the power report.',
            'Quietly type your query. Write your pretty output.',
            'Prepare your poor report. Type your prior query.',
            'True power top row output. Write your profile now.',
            'You wrote your output prior to the pretty report.'
        ]
    },
    {
        id: 'b4',
        title: 'Bottom Row Practice',
        content: 'Can you come back next Monday? We can meet in the zone. Zinc mines are vacant. Move the van back, man. Commas, periods, and slashes. / bin / ban / bun. The zebra can zoom near the moon. My name is Max. Come back soon to the cab.',
        difficulty: 'Beginner',
        category: 'Fundamentals',
        description: 'Strengthen your reach to the bottom row keys.',
        theory: 'The bottom row requires a slight downward reach. Keep your wrists neutral and avoid resting them on the desk to maintain mobility.',
        focusKeys: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
        warmupSteps: [
            { text: 'zxcv vcxz z x c v', insight: 'Left bottom row calibration.' },
            { text: 'nm,. .,mn n m , .', insight: 'Right bottom row calibration.' },
            { text: 'vm nm vm nm move move', insight: 'Practicing the index finger reaches for the bottom row.' },
            { text: 'can bin van man bank', insight: 'Common three-letter words using the bottom row.' },
            { text: 'zone next back come meet', insight: 'Combining bottom row reaches with home row stability.' }
        ],
        practiceVariations: [
            'Can we meet next Monday? You can come back in the zone.',
            'We can come back next Monday? Can you meet in the zone.',
            'You can meet next Monday? We can come back in the zone.',
            'Can you meet in the zone? We can come back next Monday.',
            'We can come next Monday? You can meet back in the zone.',
            'Can we come back in the zone? You can meet next Monday.',
            'You can come next Monday? Can we meet back in the zone.',
            'Can you meet back in the zone? We can come next Monday.',
            'We can meet next Monday? Can you come back in the zone.',
            'You can come back in the zone? Can we meet next Monday.',
            'Zinc mines are vacant. Move the van back, man now.',
            'Commas, periods, and slashes. / bin / ban / bun.',
            'The zebra can zoom near the moon. My name is Max.',
            'Come back soon to the cab. Meet me in the zone.',
            'Next Monday we can meet. Come back to the zinc mine.',
            'Move the van now, Max. My name is in the zone.',
            'Commas and periods are on the bottom row now.',
            'The zebra and the moon. Zoom back next Monday, man.',
            'Meet me back in the cab. The van is near the mine.',
            'You can come back soon. We can meet in the zone.'
        ]
    },
    {
        id: 'b5',
        title: 'Simple Sentences',
        content: 'I can see you. We are all here. This is our home. They are with us. What is that there? Use the new one. Make time for good things. Look at the little light. Find the first form. Give them great group games. Help him hold his hat.',
        difficulty: 'Beginner',
        category: 'Words',
        description: 'Type the most common words in the English language.',
        theory: 'Shift your focus from individual letters to whole words. Trust your muscle memory to "burst" familiar patterns like "the" or "and".',
        focusKeys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'e', 't', 'o', 'i', 'n'],
        warmupSteps: [
            { text: 'the and the and they they', insight: 'The most common word patterns.' },
            { text: 'was for was for with with', insight: 'Medium frequency functional words.' },
            { text: 'this that this that then then', insight: 'Practicing the "th" flow across the keyboard.' },
            { text: 'home work home work here here', insight: 'Common four-letter words.' },
            { text: 'i can see you we are all here', insight: 'Simple sentence structure calibration.' }
        ],
        practiceVariations: [
            'We can see you. I am all here. This is our home.',
            'This is our home. We can see you. I am all here.',
            'I am all here. This is our home. We can see you.',
            'We are all here. I can see you. This is our home.',
            'This is our home. I can see you. We are all here.',
            'I can see you. This is our home. We are all here.',
            'We can see you. This is our home. I am all here.',
            'I am all here. We can see you. This is our home.',
            'This is our home. We are all here. I can see you.',
            'We are all here. This is our home. I can see you.',
            'What is that there? Use the new one for good.',
            'Make time for good things. Look at the little light.',
            'Find the first form. Give them great group games.',
            'Help him hold his hat. They are with us today.',
            'We are with them. What is the new one for home?',
            'Look at the light. Find the good things for us.',
            'Great group games are good. Help them with the form.',
            'I can see the light. We are with you at home.',
            'Use the first form today. Make time for the group.',
            'They are here with us. Find the great home for all.'
        ]
    },
    {
        id: 'b6',
        title: 'Left Hand Focus',
        content: 'We are fast. Test the best. Rest at the west gate. Create a great crate. Tread water after tea. Fear the bear gear. Read the deed freed. A vast cast at the feast. We crave brave waves. Save the date for the gate. The red car was far.',
        difficulty: 'Beginner',
        category: 'Hand Isolation',
        description: 'Isolate and strengthen your left hand typing.',
        theory: 'When typing with only one hand, the tendency is to drift. Keep your right hand resting lightly on its home position to stay centered.',
        focusKeys: ['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v'],
        warmupSteps: [
            { text: 'asdf qwer zxcv asdf', insight: 'Full left-hand grid sweep.' },
            { text: 'wa se dr ft wa se dr ft', insight: 'Vertical reaches for the left hand.' },
            { text: 'test rest west guest', insight: 'Left-hand dominant word patterns.' },
            { text: 'fast fact face fate', insight: 'Practicing speed on left-hand only clusters.' },
            { text: 'we are fast test the best', insight: 'Combining left-hand patterns into sentences.' }
        ],
        practiceVariations: [
            'Test the best. We are fast. Rest at the west gate.',
            'Rest at the west gate. Test the best. We are fast.',
            'We are fast. Rest at the west gate. Test the best.',
            'Test the best. Rest at the west gate. We are fast.',
            'Rest at the west gate. We are fast. Test the best.',
            'We are fast. Test the best. Rest at the west gate.',
            'Test the best. We are fast. Rest at the west gate.',
            'Rest at the west gate. Test the best. We are fast.',
            'We are fast. Rest at the west gate. Test the best.',
            'Test the best. Rest at the west gate. We are fast.',
            'Create a great crate. Tread water after tea now.',
            'Fear the bear gear. Read the deed freed for me.',
            'A vast cast at the feast. We crave brave waves.',
            'Save the date for the gate. The red car was far.',
            'Test the fate. Crate the bear. Fear the waves.',
            'Great waves save the gate. Test the vast cast.',
            'Tread the water after the feast. Read the deed.',
            'Brave waves crave the red car. West gate rest.',
            'Create the fate for the feast. Save the bear.',
            'Fast car far at the west gate. Read the great deed.'
        ]
    },
    {
        id: 'b7',
        title: 'Right Hand Focus',
        content: 'Look at the moon. Jump in the pool. Only milk for you. I will kill the hill. You pull the pill. Join the union opinion. Hula hoop loop. John, look up the hook. In my opinion, you look ill. Mill millions of minimal mini mills.',
        difficulty: 'Beginner',
        category: 'Hand Isolation',
        description: 'Build right hand independence and accuracy.',
        theory: 'The right hand handles many vowels and most punctuation. Focus on the pinky finger’s reach for the semicolon and period.',
        focusKeys: ['y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', ';', 'n', 'm', ',', '.', '/'],
        warmupSteps: [
            { text: 'jkl; uiop nm,. jkl;', insight: 'Full right-hand grid sweep.' },
            { text: 'yj uk il o; yj uk il o;', insight: 'Vertical reaches for the right hand.' },
            { text: 'look hook look hook', insight: 'Double-vowel patterns for the right hand.' },
            { text: 'milk pool milk pool jumping', insight: 'Right-hand dominant word patterns.' },
            { text: 'only milk for you jump in', insight: 'Combining right-hand patterns into sentences.' }
        ],
        practiceVariations: [
            'Jump in the pool. Look at the moon. Only milk for you.',
            'Only milk for you. Jump in the pool. Look at the moon.',
            'Look at the moon. Only milk for you. Jump in the pool.',
            'Jump in the pool. Only milk for you. Look at the moon.',
            'Only milk for you. Look at the moon. Jump in the pool.',
            'Look at the moon. Jump in the pool. Only milk for you.',
            'Jump in the pool. Look at the moon. Only milk for you.',
            'Only milk for you. Jump in the pool. Look at the moon.',
            'Look at the moon. Only milk for you. Jump in the pool.',
            'Jump in the pool. Only milk for you. Look at the moon.',
            'I will kill the hill. You pull the pill join now.',
            'Join the union opinion. Hula hoop loop in pool.',
            'John, look up the hook. In my opinion you look.',
            'Mill millions of minimal mini mills for you now.',
            'Look up the pool. Join the hula hoop loop now.',
            'Opinions on the union pool. Pull the pill now.',
            'Minimal mills for millions. Look at the moon.',
            'Jump for the milk. Only you look at the hill.',
            'The hook is on the pool. Join the union, John.',
            'Mini mills in the pool. Look at the union now.'
        ]
    },
    {
        id: 'b8',
        title: 'Vowel Mastery',
        content: 'I have an idea about the audio. It is unique and equal. Areas of outer aura. Queue up the units. An eerie audio area. Our era is auto. I see a sea of ease. Adieu to the beau. A quiet quote is quite quaint. Use usual users.',
        difficulty: 'Beginner',
        category: 'Letters',
        description: 'Perfect your vowel key placement and rhythm.',
        theory: 'Vowels (A, E, I, O, U) are the most typed keys. Master the "triangle" of your hands to reach them without breaking your flow.',
        focusKeys: ['a', 'e', 'i', 'o', 'u'],
        warmupSteps: [
            { text: 'aeiou uoiea a e i o u', insight: 'Pure vowel sequence calibration.' },
            { text: 'ea io ou ai ea io ou', insight: 'Common vowel pairs (diphthongs).' },
            { text: 'idea audio idea audio', insight: 'Words that are heavily vowel-dependent.' },
            { text: 'equal unique equal unique', insight: 'Practicing rare letters (q, u) alongside vowels.' },
            { text: 'i have an idea about the audio', insight: 'Full sentence vowel flow.' }
        ],
        practiceVariations: [
            'It is unique about the audio. I have an idea and equal.',
            'I have an equal about the audio. It is unique and idea.',
            'It is idea about the audio. I have an unique and equal.',
            'I have an audio about the unique. It is idea and equal.',
            'It is equal about the unique. I have an audio and idea.',
            'I have an unique about the idea. It is audio and equal.',
            'It is audio about the idea. I have an equal and unique.',
            'I have an idea about the unique. It is equal and audio.',
            'It is unique about the equal. I have an audio and idea.',
            'I have an audio about the equal. It is idea and unique.',
            'Areas of outer aura. Queue up the units in idea.',
            'An eerie audio area. Our era is auto and equal.',
            'I see a sea of ease. Adieu to the beau today.',
            'A quiet quote is quite quaint. Use usual users.',
            'Unique audio areas. Queue up the idea for you.',
            'An equal idea of outer aura. See the sea of ease.',
            'Quaint quotes are quiet. Use usual audio units.',
            'A sea of eerie ease. Adieu to the equal aura.',
            'Queue up the usual users. Our era is unique.',
            'An eerie sea of audio. Use the quaint idea now.'
        ]
    },
    {
        id: 'b9',
        title: 'Number Row Introduction',
        content: 'Call me at 555-0123. My code is 4567. Room 890 is open. Order 100 items. Need 50 to 55 units. 1990 was 30 years ago. 2 + 2 = 4. 1st place prize is $500. Call 911 in case of 0 emergencies. Item #284 is 12% off today.',
        difficulty: 'Beginner',
        category: 'Numbers',
        description: 'Learn to type numbers without looking down.',
        theory: 'Reaching for numbers requires a larger extension. Try to keep your palms steady and use only your fingers to reach up, then "snap" back to home.',
        focusKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-'],
        warmupSteps: [
            { text: '12345 67890 1 2 3 4 5', insight: 'Full number row sweep calibration.' },
            { text: '10 20 30 40 50 100 200', insight: 'Common numeric patterns.' },
            { text: '555-0123 555-0123', insight: 'Practicing phone number formatting.' },
            { text: '4567 8901 2345 6789', insight: 'Four-digit pin code simulations.' },
            { text: 'call me at 555-0123 room 890', insight: 'Mixing text and numeric data.' }
        ],
        practiceVariations: [
            'My code is 4567. Call me at 555-0123. Room 890 is open.',
            'Room 890 is open. My code is 4567. Call me at 555-0123.',
            'Call me at 555-0123. Room 890 is open. My code is 4567.',
            'My code is 4567. Room 890 is open. Call me at 555-0123.',
            'Room 890 is open. Call me at 555-0123. My code is 4567.',
            'Call me at 555-0890. My code is 5551. Room 234 is open.',
            'My code is 8901. Call me at 555-2345. Room 678 is open.',
            'Room 123 is open. My code is 6789. Call me at 555-0456.',
            'Call me at 555-7890. Room 012 is open. My code is 3456.',
            'My code is 2345. Room 567 is open. Call me at 555-8901.',
            'Order 100 items today. Need 50 to 55 units now.',
            '1990 was 30 years ago. 2 + 2 = 4 for everyone.',
            '1st place prize is $500. Call 911 in case of zero.',
            'Item #284 is 12% off today. Room 555 is open.',
            'Call me at 123-4567. Room 100 is open in 2024.',
            'The code is 9876. Need 12 units for the room.',
            'Price is $100 today. Call 911 for the units.',
            'Room 789 is open now. My code is 1234 for you.',
            'Order 50 items today. 2 + 3 = 5 in the room.',
            'The prize is $1000. Item #123 is 50% off now.'
        ]
    },
    {
        id: 'b10',
        title: 'Basic Punctuation',
        content: 'Hello! How are you? I am fine, thank you. Have a great day. "Yes," she said. Wait; did you see that? No: it was gone. Who? What? Where? When? Stop! Go. Help. Run! The end. A comma, a pause. A period, a stop. A semi-colon; a bridge.',
        difficulty: 'Beginner',
        category: 'Punctuation',
        description: 'Incorporate periods, commas, and question marks smoothly.',
        theory: 'Punctuation usually follows a space or a word. Focus on the rhythmic "double-tap" of the letter then the symbol.',
        focusKeys: ['.', ',', '!', '?', ';', ':'],
        warmupSteps: [
            { text: 'abc, abc. abc! abc?', insight: 'Basic symbol-after-word calibration.' },
            { text: 'yes, no. yes, no. then?', insight: 'Common conversational punctuation.' },
            { text: 'one; two; three: four.', insight: 'Practicing the semicolon and colon.' },
            { text: 'hello! how are you?', insight: 'Greeting and question patterns.' },
            { text: 'i am fine, thank you. really!', insight: 'Mixing commas and advanced symbols.' }
        ],
        practiceVariations: [
            'Hi! How are you? I am great, thank you. Have a nice day.',
            'Hello! Are you fine? I am good, thank you. Have a wonderful day.',
            'Hey! How are you? I am well, thank you. Have a lovely day.',
            'Greetings! How are you? I am okay, thank you. Have a blessed day.',
            'Hello! Are you well? I am fine, thank you. Have a super day.',
            'Hi! How are you? I am excellent, thank you. Have a fantastic day.',
            'Hello! How are you? I am happy, thank you. Have a beautiful day.',
            'Hey! Are you good? I am fine, thank you. Have a great day.',
            'Hello! How are you? I am alright, thank you. Have a good day.',
            'Hi! Are you okay? I am fine, thank you. Have a splendid day.',
            'Wait; did you see that? No: it was gone for good.',
            'Who? What? Where? When? Stop! Go. Help. Run! End.',
            'A comma, a pause. A period, a stop. A semicolon; a bridge.',
            'Yes, she said. Hello! How are you today? Run!',
            'Stop! Go now. Who is there? A period is a stop.',
            'Wait; what is that? Help! Run to the end now.',
            'Hi! Are you well? Yes, I am fine. Thank you.',
            'Where are you? Stop! Go back to the end today.',
            'A bridge is a semicolon; a stop is a period.',
            'Hello! Good day. How are you? Fine, thank you!'
        ]
    },

    // INTERMEDIATE DRILLS (10)
    {
        id: 'i1',
        title: 'Advanced Bigrams',
        content: 'The quick brown fox jumps over the lazy dog near the river. The sun was setting behind the distant hills, casting long shadows across the valley. A gentle breeze rustled the leaves of the old oak tree. Birds chirped their final songs of the evening. It was a peaceful end to a busy day in the countryside.',
        difficulty: 'Intermediate',
        category: 'Bigrams',
        description: 'Master complex two-letter patterns for speed.',
        theory: 'Advanced bigrams often involve awkward finger stretching or double-tapping. Focus on the "roll"—the speed at which you can sequence two keys.',
        focusKeys: ['t', 'h', 'e', 'r', 'i', 'v', 'b', 'n', 'f', 'x', 'm', 'q'],
        warmupSteps: [
            { text: 'th he falling through', insight: 'Practicing the "th" and "he" flow.' },
            { text: 'in er interesting earlier', insight: 'Mastering "in" and "er" transitions.' },
            { text: 'an ou another outcome', insight: 'Focusing on vowel-consonant "rolls".' },
            { text: 'st ed started decided', insight: 'Common suffix bigram calibration.' },
            { text: 'the quick brown fox jumps', insight: 'Sentence-level bigram flow.' }
        ],
        practiceVariations: [
            'The lazy dog jumps over the quick brown fox near the river.',
            'The brown fox runs over the lazy dog near the quick river.',
            'The quick dog jumps over the brown fox near the lazy river.',
            'The lazy fox runs over the quick dog near the brown river.',
            'The brown dog jumps over the lazy fox near the quick river.',
            'The quick fox runs over the brown dog near the lazy river.',
            'The lazy brown fox jumps over the quick dog near the river.',
            'The brown quick dog runs over the lazy fox near the river.',
            'The quick lazy fox jumps over the brown dog near the river.',
            'The brown lazy dog runs over the quick fox near the river.'
        ]
    },
    {
        id: 'i2',
        title: 'Common Phrases',
        content: 'Thank you for your time. I appreciate your help. Looking forward to hearing from you. Please let me know if you have any questions. I will get back to you as soon as possible. It was a pleasure meeting you yesterday. Have a wonderful weekend. Best regards to the whole team. Let\'s keep in touch.',
        difficulty: 'Intermediate',
        category: 'Trigrams',
        description: 'Build muscle memory for three-letter sequences.',
        theory: 'Trigrams (three-letter sequences) are the heart of fluid typing. Try to read ahead and visualize the entire word before you start typing it.',
        focusKeys: ['t', 'h', 'e', 'f', 'o', 'r', 'y', 'u', 'i', 'a', 'p', 'l'],
        warmupSteps: [
            { text: 'the ing and the ing and', insight: 'Mastering the top 3 trigrams in English.' },
            { text: 'for you for you forward', insight: 'Common phrase-start calibration.' },
            { text: 'thank you thank you appreciate', insight: 'Professional courtesy vocabulary.' },
            { text: 'hearing from you soon', insight: 'Standard email phrase flow.' },
            { text: 'i appreciate your time today', insight: 'Full phrase speed burst.' }
        ],
        practiceVariations: [
            'I appreciate your time. Thank you for your help. Looking forward to hearing from you.',
            'Looking forward to your time. Thank you for your help. I appreciate hearing from you.',
            'Thank you for your help. I appreciate your time. Looking forward to hearing from you.',
            'I appreciate your help. Looking forward to your time. Thank you for hearing from you.',
            'Looking forward to your help. I appreciate your time. Thank you for hearing from you.',
            'Thank you for your time. Looking forward to your help. I appreciate hearing from you.',
            'I appreciate your time. Looking forward to your help. Thank you for hearing from you.',
            'Looking forward to your time. Thank you for your help. I appreciate hearing from you.',
            'Thank you for your help. Looking forward to your time. I appreciate hearing from you.',
            'I appreciate your help. Thank you for your time. Looking forward to hearing from you.'
        ]
    },
    {
        id: 'i3',
        title: 'Business Vocabulary',
        content: 'Please review the project proposal and send your feedback by the deadline. The budget allocation for Q3 needs to be finalized before the board meeting. We are targeting a 15% increase in operational efficiency. The marketing team will launch the new campaign next month. Ensure all stakeholders are aligned.',
        difficulty: 'Intermediate',
        category: 'Professional',
        description: 'Practice common business and corporate terms.',
        theory: 'Business terms often use formal Latin roots. These words are usually longer and require consistent rhythm rather than raw speed.',
        focusKeys: ['p', 'r', 'o', 'j', 'e', 'c', 't', 's', 'a', 'l', 'd', 'i', 'n'],
        warmupSteps: [
            { text: 'proj prop proj prop proposal', insight: 'Root-word repetition for business terms.' },
            { text: 'review review feedback feedback', insight: 'Common professional action words.' },
            { text: 'deadline deadline project project', insight: 'Time-sensitive terminology.' },
            { text: 'meeting budget meeting budget', insight: 'Corporate operations vocabulary.' },
            { text: 'please review the project proposal', insight: 'Contextual business phrase flow.' }
        ],
        practiceVariations: [
            'Please send the project proposal and review your feedback by the deadline.',
            'Please review the project feedback and send your proposal by the deadline.',
            'Please send the project deadline and review your proposal by the feedback.',
            'Please review the project deadline and send your feedback by the proposal.',
            'Please send the project feedback and review your deadline by the proposal.',
            'Please review the project proposal and send your deadline by the feedback.',
            'Please send the project proposal and review your deadline by the feedback.',
            'Please review the project feedback and send your deadline by the proposal.',
            'Please send the project deadline and review your feedback by the proposal.',
            'Please review the project proposal and send your feedback by the deadline.'
        ]
    },
    {
        id: 'i4',
        title: 'Technical Terms',
        content: 'The database server requires a network protocol update to improve system performance. Please schedule maintenance during the off-peak window to minimize downtime. Ensure all backups are verified before proceeding. The firewall rules must also be updated to allow traffic on port 8080. Check the logs for any errors.',
        difficulty: 'Intermediate',
        category: 'Technical',
        description: 'Type programming and IT terminology with precision.',
        theory: 'Technical words frequently use rare consonants like "x", "z", and "v". Precision is critical here, as many technical terms look similar but have different meanings.',
        focusKeys: ['d', 'a', 't', 'b', 's', 'e', 'r', 'v', 'n', 'w', 'k', 'p', 'i'],
        warmupSteps: [
            { text: 'data base data base database', insight: 'Technical compound word calibration.' },
            { text: 'serv serv server server', insight: 'Vertical reach practice (e, r, v).' },
            { text: 'proto proto protocol protocol', insight: 'Rhythmic repetition for Greek-root terms.' },
            { text: 'system network system network', insight: 'Foundational IT infrastructure words.' },
            { text: 'the database server requires update', insight: 'Technical sentence construction.' }
        ],
        practiceVariations: [
            'The network server requires a database protocol update to improve system performance.',
            'The system server requires a network protocol update to improve database performance.',
            'The database protocol requires a network update to improve server system performance.',
            'The network protocol requires a database update to improve server system performance.',
            'The system protocol requires a database update to improve network server performance.',
            'The database server requires a system protocol update to improve network performance.',
            'The network server requires a system protocol update to improve database performance.',
            'The system server requires a database protocol update to improve network performance.',
            'The database protocol requires a system update to improve network server performance.',
            'The network protocol requires a system update to improve database server performance.'
        ]
    },
    {
        id: 'i5',
        title: 'Mixed Case Practice',
        content: 'JavaScript and Python are popular languages. HTML and CSS create websites. React vs Angular is a common debate. Node.js allows JavaScript on the server. SQL is used for database management. Git is essential for version control. DevOps combines development and operations. API integration is key for modern apps.',
        difficulty: 'Intermediate',
        category: 'Technical',
        description: 'Handle capital letters in technical contexts.',
        theory: 'Using the Shift key correctly is the key to professional typing. Use the opposite hand’s Pinky to hold Shift while you strike the target key.',
        focusKeys: ['Shift', 'J', 'S', 'P', 'H', 'T', 'M', 'L', 'C'],
        warmupSteps: [
            { text: 'Aa Bb Cc Dd Ee Ff Gg', insight: 'Alternating case calibration.' },
            { text: 'JavaScript Python HTML CSS', insight: 'Proper noun capitalization bursts.' },
            { text: 'API URL JSON XML HTTP', insight: 'All-caps acronym efficiency.' },
            { text: 'John Doe Jane Smith Mary', insight: 'Common name capitalization.' },
            { text: 'JavaScript and Python are popular', insight: 'Mixing case in full sentences.' }
        ],
        practiceVariations: [
            'Python and JavaScript are popular languages. CSS and HTML create websites.',
            'HTML and CSS are popular languages. JavaScript and Python create websites.',
            'JavaScript and HTML are popular languages. Python and CSS create websites.',
            'Python and CSS are popular languages. HTML and JavaScript create websites.',
            'CSS and JavaScript are popular languages. Python and HTML create websites.',
            'HTML and Python are popular languages. CSS and JavaScript create websites.',
            'JavaScript and CSS are popular languages. HTML and Python create websites.',
            'Python and HTML are popular languages. JavaScript and CSS create websites.',
            'CSS and HTML are popular languages. JavaScript and Python create websites.',
            'JavaScript and Python are popular languages. HTML and CSS create websites.'
        ]
    },
    {
        id: 'i6',
        title: 'Email Formatting',
        content: 'Dear Team, I hope this message finds you well. Please find the attached report regarding the Q4 sales performance. We have exceeded our targets by 10%. I would like to schedule a meeting to discuss the roadmap for next year. Let me know your availability. Best regards, John Smith, Regional Director.',
        difficulty: 'Intermediate',
        category: 'Professional',
        description: 'Practice professional email writing patterns.',
        theory: 'Emails follow predictable structural patterns. Practice the "Dear [Name]," and "Best regards," sequences to automate your correspondence.',
        focusKeys: [',', 'T', 'I', 'M', 'B', 'R', 'J', 'S', 'A', 'D'],
        warmupSteps: [
            { text: 'dear team dear colleagues', insight: 'Email salutation patterns.' },
            { text: 'i hope i hope finds you well', insight: 'Introductory phrase flow.' },
            { text: 'attached attached reports', insight: 'Referencing email attachments.' },
            { text: 'best regards kind regards', insight: 'Closing and sign-off variations.' },
            { text: 'best regards, john smith', insight: 'Full signature calibration.' }
        ],
        practiceVariations: [
            'Dear Team, I hope this email finds you well. Please find the attached document. Best regards, Sarah',
            'Dear Colleagues, I hope this message finds you well. Please find the attached file. Kind regards, Mike',
            'Dear All, I hope this email finds you well. Please find the attached report. Warm regards, Lisa',
            'Dear Team, I hope this note finds you well. Please find the attached summary. Best wishes, Tom',
            'Dear Everyone, I hope this message finds you well. Please find the attached update. Sincerely, Emma',
            'Dear Team, I hope this email finds you well. Please find the attached analysis. Best regards, David',
            'Dear Colleagues, I hope this note finds you well. Please find the attached presentation. Kind regards, Anna',
            'Dear All, I hope this message finds you well. Please find the attached proposal. Warm regards, Chris',
            'Dear Team, I hope this email finds you well. Please find the attached overview. Best regards, Kate',
            'Dear Everyone, I hope this note finds you well. Please find the attached memo. Sincerely, Mark'
        ]
    },
    {
        id: 'i7',
        title: 'Numeric Data Entry',
        content: 'The meeting is on 2024-02-15 at 3:30 PM. Budget: $12,500.00. Invoice #9982 was paid on 01/20/2024. The total revenue for the period was $45,230.50. We processed 1,250 transactions with a success rate of 99.8%. The server load peaked at 85% capacity at 12:00 PM. Account balance: $5,400.25.',
        difficulty: 'Intermediate',
        category: 'Numbers',
        description: 'Type dates, currency, and formatted numbers accurately.',
        theory: 'Mixing numbers and symbols ($, %, :) requires high finger agility. Keep your hands relaxed and use a "pounce" motion for the top row reaches.',
        focusKeys: ['$', '%', ':', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        warmupSteps: [
            { text: '2024-02-15 2024-02-15', insight: 'ISO date format calibration.' },
            { text: '3:30 PM 4:15 AM 12:00', insight: 'Time format and AM/PM capitalization.' },
            { text: '$12,500 $1,000 $50.00', insight: 'Currency and comma placement.' },
            { text: '15% 23% 100% 340 bps', insight: 'Percentages and financial units.' },
            { text: 'budget: $12,500.00 today', insight: 'Mixing labels, symbols, and values.' }
        ],
        practiceVariations: [
            'The meeting is on 2024-03-20 at 2:45 PM. Budget: $15,750.00',
            'The meeting is on 2024-04-10 at 4:15 PM. Budget: $18,200.00',
            'The meeting is on 2024-05-25 at 1:30 PM. Budget: $22,450.00',
            'The meeting is on 2024-06-18 at 5:00 PM. Budget: $11,800.00',
            'The meeting is on 2024-07-22 at 3:45 PM. Budget: $19,600.00',
            'The meeting is on 2024-08-14 at 2:30 PM. Budget: $14,300.00',
            'The meeting is on 2024-09-30 at 4:00 PM. Budget: $16,900.00',
            'The meeting is on 2024-10-12 at 1:15 PM. Budget: $20,100.00',
            'The meeting is on 2024-11-28 at 3:00 PM. Budget: $13,750.00',
            'The meeting is on 2024-12-05 at 2:15 PM. Budget: $17,400.00'
        ]
    },
    {
        id: 'i8',
        title: 'Symbol Combinations',
        content: 'Email me at john@company.com or visit https://website.com for more info. Use protocols like ssh://user@host:22 or ftp://files.server.net. Check the path /var/www/html/index.php. The API endpoint is https://api.service.io/v1/users?id=100&sort=asc. Don\'t forget to escape characters like \\n and \\t.',
        difficulty: 'Intermediate',
        category: 'Symbols',
        description: 'Master special characters used in coding and web.',
        theory: 'Web and coding symbols (/, @, .) often appear together in URLs and emails. Practice these as unified "swiping" motions.',
        focusKeys: ['@', '.', '/', ':', 'h', 't', 'p', 's'],
        warmupSteps: [
            { text: 'user@host.com name@domain', insight: 'Email address structure calibration.' },
            { text: 'https:// http:// website.com', insight: 'URL protocol and domain patterns.' },
            { text: 'www.google.com www.aws.com', insight: 'Subdomain and commercial TLDs.' },
            { text: 'visit our site/info page', insight: 'Mixing text and forward slashes.' },
            { text: 'email me at john@example.com', insight: 'Full contextual symbol integration.' }
        ],
        practiceVariations: [
            'Email me at sarah@business.com or visit https://portal.com for more info.',
            'Email me at mike@startup.com or visit https://platform.com for more info.',
            'Email me at lisa@agency.com or visit https://service.com for more info.',
            'Email me at tom@enterprise.com or visit https://system.com for more info.',
            'Email me at emma@firm.com or visit https://network.com for more info.',
            'Email me at david@corp.com or visit https://application.com for more info.',
            'Email me at anna@group.com or visit https://solution.com for more info.',
            'Email me at chris@team.com or visit https://resource.com for more info.',
            'Email me at kate@office.com or visit https://dashboard.com for more info.',
            'Email me at mark@studio.com or visit https://interface.com for more info.'
        ]
    },
    {
        id: 'i9',
        title: 'Long Words',
        content: 'The administration will implement the communication strategy with international collaboration. Comprehensive infrastructure development is essential for sustainable organizational growth. The revitalization of the transportation sector requires multidimensional coordination. Uncharacteristically, the representative remained silent.',
        difficulty: 'Intermediate',
        category: 'Words',
        description: 'Build endurance with lengthy vocabulary.',
        theory: 'Long words (10+ letters) test your endurance and working memory. Break them into smaller chunks (e.g., "inter-nation-al") as you type.',
        focusKeys: ['a', 'd', 'm', 'i', 'n', 's', 't', 'r', 'o', 'c', 'u', 'l', 'b'],
        warmupSteps: [
            { text: 'admin admin administration', insight: 'Building long words from roots.' },
            { text: 'comm comm communication', insight: 'Practicing double-m and double-n.' },
            { text: 'strat strat strategy strategy', insight: 'Common suffix ("egy", "ogy") drills.' },
            { text: 'inter inter international', insight: 'Mastering the "inter" prefix.' },
            { text: 'administration will implement now', insight: 'Contextual long word sentencing.' }
        ],
        practiceVariations: [
            'The organization will implement the communication strategy with international collaboration.',
            'The administration will develop the communication strategy with international cooperation.',
            'The organization will establish the communication approach with international collaboration.',
            'The administration will implement the coordination strategy with international cooperation.',
            'The organization will implement the communication strategy with international partnership.',
            'The administration will develop the coordination strategy with international collaboration.',
            'The organization will establish the communication strategy with international cooperation.',
            'The administration will implement the communication approach with international partnership.',
            'The organization will develop the communication strategy with international collaboration.',
            'The administration will establish the coordination strategy with international cooperation.'
        ]
    },
    {
        id: 'i10',
        title: 'Sentence Flow',
        content: 'Pack my box with five dozen liquor jugs. The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow. Two driven jocks help fax my big quiz. The five boxing wizards jump quickly. Waltz, bad nymph, for quick jigs vex. Blowzy night-frumps vex\'d Jack Q. Glum Schwartzkopf was vex\'d by NJ pig.',
        difficulty: 'Intermediate',
        category: 'Sentences',
        description: 'Maintain speed across complete pangram sentences.',
        theory: 'Pangrams (sentences using every letter) are the ultimate test of all-around skill. Focus on keeping a perfectly steady rhythm between the easy and hard letters.',
        focusKeys: ['q', 'x', 'z', 'j', 'v', 'b', 'f'],
        warmupSteps: [
            { text: 'the quick brown fox jumps', insight: 'The classic pangram calibration.' },
            { text: 'pack my box with five dozen', insight: 'Rare letter concentration drill.' },
            { text: 'lazy dog lazy dog brown fox', insight: 'Rhythmic word pairings.' },
            { text: 'over the over the under the', insight: 'Connecting words for flow.' },
            { text: 'pack my box with five dozen jugs', insight: 'Final full-spectrum calibration.' }
        ],
        practiceVariations: [
            'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.',
            'Pack my box with five dozen liquor jugs. The lazy dog jumps over the quick brown fox.',
            'The lazy dog jumps over the quick brown fox. Pack my box with five dozen liquor jugs.',
            'Pack my box with five dozen liquor jugs. The brown fox jumps over the lazy quick dog.',
            'The quick fox jumps over the lazy brown dog. Pack my box with five dozen liquor jugs.',
            'Pack my box with five dozen liquor jugs. The lazy brown dog jumps over the quick fox.',
            'The brown dog jumps over the quick lazy fox. Pack my box with five dozen liquor jugs.',
            'Pack my box with five dozen liquor jugs. The quick lazy fox jumps over the brown dog.',
            'The lazy quick dog jumps over the brown fox. Pack my box with five dozen liquor jugs.',
            'Pack my box with five dozen liquor jugs. The brown quick fox jumps over the lazy dog.'
        ]
    },

    // PROFESSIONAL DRILLS (10)
    {
        id: 'p1',
        title: 'Code Snippets',
        content: 'const handleClick = (event) => { event.preventDefault(); setState(prevState => !prevState); console.log("State toggled", prevState); if (isValid) { submitData(); } else { setError("Invalid input"); } };',
        difficulty: 'Professional',
        category: 'Programming',
        description: 'Type real JavaScript code with perfect syntax.',
        theory: 'Coding requires high precision with brackets, parentheses, and semicolons. Treat these as "anchor points" for your hands while your fingers reach for the alphanumeric keys.',
        focusKeys: ['(', ')', '{', '}', ';', '=', '>', '!', '.', '_', 'C', 'S'],
        warmupSteps: [
            { text: '() {} [] <> ; : =', insight: 'Essential coding symbol calibration.' },
            { text: 'const let var function', insight: 'Common JavaScript keyword bursts.' },
            { text: 'prevState => !prevState', insight: 'Arrow function and state logic symbols.' },
            { text: 'event.preventDefault();', insight: 'Standard DOM method flow.' },
            { text: 'const handleClick = (e) => {}', insight: 'Function declaration speed and precision.' }
        ],
        practiceVariations: [
            'const handleSubmit = (event) => { event.preventDefault(); setData(prevData => !prevData); };',
            'const handleChange = (event) => { event.preventDefault(); setValue(prevValue => !prevValue); };',
            'const handleInput = (event) => { event.preventDefault(); setForm(prevForm => !prevForm); };',
            'const handleUpdate = (event) => { event.preventDefault(); setStatus(prevStatus => !prevStatus); };',
            'const handleToggle = (event) => { event.preventDefault(); setActive(prevActive => !prevActive); };',
            'const handlePress = (event) => { event.preventDefault(); setVisible(prevVisible => !prevVisible); };',
            'const handleSelect = (event) => { event.preventDefault(); setChecked(prevChecked => !prevChecked); };',
            'const handleFocus = (event) => { event.preventDefault(); setEnabled(prevEnabled => !prevEnabled); };',
            'const handleBlur = (event) => { event.preventDefault(); setValid(prevValid => !prevValid); };',
            'const handleReset = (event) => { event.preventDefault(); setLoading(prevLoading => !prevLoading); };'
        ]
    },
    {
        id: 'p2',
        title: 'Medical Terminology',
        content: 'The patient requires cardiovascular assessment and gastrointestinal examination for accurate diagnosis. History of hypertension and hyperlipidemia. Recommend EKG and lipid profile. Follow up in two weeks to review results and adjust medication if necessary.',
        difficulty: 'Professional',
        category: 'Medical',
        description: 'Master complex medical vocabulary for healthcare professionals.',
        theory: 'Medical terms are often polysyllabic and use complex Greek/Latin suffixes. Break these long words into visual phonemes (e.g., "cardio-vas-cular") as you type them.',
        focusKeys: ['c', 'a', 'r', 'd', 'i', 'o', 'v', 's', 'u', 'l', 'g', 't', 'n'],
        warmupSteps: [
            { text: 'cardio vascular cardiovasc', insight: 'Prefix and suffix merging for medical terms.' },
            { text: 'gastro intestinal gastroent', insight: 'Practicing long anatomical vowels.' },
            { text: 'diagnosis examination assessment', insight: 'Common clinical operation vocabulary.' },
            { text: 'patient requires assessment', insight: 'Standard medical phrasing flow.' },
            { text: 'cardiovascular gastrointestinal exam', insight: 'High-end medical terminology stamina.' }
        ],
        practiceVariations: [
            'The patient requires respiratory assessment and neurological examination for accurate diagnosis.',
            'The patient requires gastrointestinal assessment and cardiovascular examination for accurate diagnosis.',
            'The patient requires neurological assessment and respiratory examination for accurate diagnosis.',
            'The patient requires cardiovascular assessment and respiratory examination for accurate diagnosis.',
            'The patient requires gastrointestinal assessment and neurological examination for accurate diagnosis.',
            'The patient requires respiratory assessment and cardiovascular examination for accurate diagnosis.',
            'The patient requires neurological assessment and gastrointestinal examination for accurate diagnosis.',
            'The patient requires cardiovascular assessment and neurological examination for accurate diagnosis.',
            'The patient requires respiratory assessment and gastrointestinal examination for accurate diagnosis.',
            'The patient requires gastrointestinal assessment and respiratory examination for accurate diagnosis.'
        ]
    },
    {
        id: 'p3',
        title: 'Legal Language',
        content: 'Pursuant to the agreement, notwithstanding any provisions, the plaintiff shall proceed with litigation. The defendant acknowledges that any breach of this contract will result in immediate termination. All parties agree to submit to binding arbitration in the event of a dispute.',
        difficulty: 'Professional',
        category: 'Legal',
        description: 'Practice formal legal terminology and phrasing.',
        theory: 'Legal writing uses archaic phrasing and formal punctuation. Precision is paramount—miskeying a word like "notwithstanding" can significantly slow your professional correspondence.',
        focusKeys: ['p', 'u', 'r', 's', 'u', 'a', 'n', 't', 'n', 'o', 't', 'w', 'i', 'h'],
        warmupSteps: [
            { text: 'pursuant pursuant notwithstanding', insight: 'Complex legal root word calibration.' },
            { text: 'plaintiff defendant litigation', insight: 'Courtroom and party status terminology.' },
            { text: 'provisions agreement settlement', insight: 'Contractual and document vocabulary.' },
            { text: 'notwithstanding any provisions', insight: 'Common legal connective phrasing.' },
            { text: 'pursuant to the agreement herein', insight: 'Formal legal sentence construction.' }
        ],
        practiceVariations: [
            'Pursuant to the contract, notwithstanding any clauses, the defendant shall proceed with arbitration.',
            'Pursuant to the settlement, notwithstanding any terms, the plaintiff shall proceed with mediation.',
            'Pursuant to the arrangement, notwithstanding any conditions, the defendant shall proceed with negotiation.',
            'Pursuant to the covenant, notwithstanding any stipulations, the plaintiff shall proceed with resolution.',
            'Pursuant to the understanding, notwithstanding any requirements, the defendant shall proceed with settlement.',
            'Pursuant to the agreement, notwithstanding any obligations, the plaintiff shall proceed with arbitration.',
            'Pursuant to the contract, notwithstanding any provisions, the defendant shall proceed with litigation.',
            'Pursuant to the settlement, notwithstanding any clauses, the plaintiff shall proceed with negotiation.',
            'Pursuant to the arrangement, notwithstanding any terms, the defendant shall proceed with mediation.',
            'Pursuant to the covenant, notwithstanding any conditions, the plaintiff shall proceed with settlement.'
        ]
    },
    {
        id: 'p4',
        title: 'Data Analysis Terms',
        content: 'The correlation analysis reveals significant variance in the distribution across sample populations. Regression models indicate a strong positive relationship between variable A and variable B (r = 0.85, p < 0.001). Further study is required to rule out confounding variables.',
        difficulty: 'Professional',
        category: 'Scientific',
        description: 'Master statistical and data science terminology.',
        theory: 'Data science terms involve many "r", "s", and "t" combinations. Focus on keeping your index fingers agile for the center of the keyboard where these clusters live.',
        focusKeys: ['c', 'o', 'r', 'e', 'l', 'a', 't', 'i', 'o', 'n', 'v', 'a', 'r', 'i', 'd', 's', 'p'],
        warmupSteps: [
            { text: 'corre corre correlation', insight: 'Mastering double-r and double-l words.' },
            { text: 'distri distri distribution', insight: 'Practicing the "str" consonant cluster.' },
            { text: 'variance variance deviation', insight: 'Statistical terminology calibration.' },
            { text: 'significant variance revealed', insight: 'Scientific observation phrasing.' },
            { text: 'correlation analysis reveals variance', insight: 'Full data analysis sentence flow.' }
        ],
        practiceVariations: [
            'The regression analysis reveals significant deviation in the distribution across sample populations.',
            'The variance analysis reveals significant correlation in the distribution across sample populations.',
            'The deviation analysis reveals significant regression in the distribution across sample populations.',
            'The correlation analysis reveals significant deviation in the distribution across sample populations.',
            'The regression analysis reveals significant variance in the distribution across sample populations.',
            'The deviation analysis reveals significant correlation in the distribution across sample populations.',
            'The variance analysis reveals significant regression in the distribution across sample populations.',
            'The correlation analysis reveals significant regression in the distribution across sample populations.',
            'The deviation analysis reveals significant variance in the distribution across sample populations.',
            'The regression analysis reveals significant correlation in the distribution across sample populations.'
        ]
    },
    {
        id: 'p5',
        title: 'Financial Reports',
        content: 'Q4 EBITDA increased 23% YoY to $4.7M with gross margin expansion of 340 bps to 68.2%. Net income attributable to common shareholders was $1.2M, or $0.15 per diluted share. Cash flow from operations remained strong at $2.5M. We expect Q1 revenue to grow by 10-12%.',
        difficulty: 'Professional',
        category: 'Finance',
        description: 'Handle complex financial data and abbreviations.',
        theory: 'Financial typing mixes capital letters, decimals, and currencies. Use your pinkies for the Shift key while your ring and middle fingers handle the numbers and periods.',
        focusKeys: ['$', '%', '.', 'E', 'B', 'I', 'T', 'D', 'A', 'Y', 'o', 'Q'],
        warmupSteps: [
            { text: 'Q1 Q2 Q3 Q4 EBITDA', insight: 'Fiscal quarter and financial acronyms.' },
            { text: '$1.2M $4.7M $10.0M', insight: 'Currency, decimals, and large unit labels.' },
            { text: '23% 340 bps 68.2%', insight: 'Percentage and basis point formats.' },
            { text: 'YoY YoY gross margin', insight: 'Year-over-year growth terminology.' },
            { text: 'Q4 EBITDA increased 23% YoY', insight: 'Full financial reporting sentence.' }
        ],
        practiceVariations: [
            'Q1 EBITDA increased 18% YoY to $3.2M with gross margin expansion of 250 bps to 62.5%.',
            'Q2 EBITDA increased 31% YoY to $5.8M with gross margin expansion of 420 bps to 71.3%.',
            'Q3 EBITDA increased 27% YoY to $6.1M with gross margin expansion of 380 bps to 69.8%.',
            'Q4 EBITDA increased 19% YoY to $3.9M with gross margin expansion of 290 bps to 64.7%.',
            'Q1 EBITDA increased 25% YoY to $5.3M with gross margin expansion of 360 bps to 70.1%.',
            'Q2 EBITDA increased 22% YoY to $4.5M with gross margin expansion of 310 bps to 66.4%.',
            'Q3 EBITDA increased 29% YoY to $5.6M with gross margin expansion of 400 bps to 72.9%.',
            'Q4 EBITDA increased 20% YoY to $4.1M with gross margin expansion of 270 bps to 63.8%.',
            'Q1 EBITDA increased 26% YoY to $4.9M with gross margin expansion of 350 bps to 67.6%.',
            'Q2 EBITDA increased 24% YoY to $5.2M with gross margin expansion of 330 bps to 69.2%.'
        ]
    },
    {
        id: 'p6',
        title: 'Command Line',
        content: 'git commit -m "feat: implement user authentication" && git push origin main --force; npm install && npm run build; docker build -t my-app . && docker run -p 3000:3000 -d my-app; echo "Deployment complete" >> deploy.log',
        difficulty: 'Professional',
        category: 'Programming',
        description: 'Type terminal commands with speed and precision.',
        theory: 'CLI commands often use dashes, quotes, and double-ampersands. Treat the "&&" and "--" as single rhythmic units to maintain your terminal speed.',
        focusKeys: ['-', '"', '&', 'g', 'i', 't', 'c', 'o', 'm', 'u', 's', 'h', 'p'],
        warmupSteps: [
            { text: 'git commit -m "feat:"', insight: 'Standard git workflow calibration.' },
            { text: '&& git push origin main', insight: 'Connecting commands with logic operators.' },
            { text: '--force --verbose --all', insight: 'Common CLI flag and switch patterns.' },
            { text: 'implement user authentication', insight: 'Typical commit message vocabulary.' },
            { text: 'git commit -m "fix: logic" && git push', insight: 'Full command line phrase calibration.' }
        ],
        practiceVariations: [
            'git commit -m "fix: resolve login validation" && git push origin develop --force',
            'git commit -m "feat: add password reset" && git push origin staging --force',
            'git commit -m "fix: update session handling" && git push origin production --force',
            'git commit -m "feat: implement email verification" && git push origin release --force',
            'git commit -m "fix: correct token expiration" && git push origin hotfix --force',
            'git commit -m "feat: add two-factor auth" && git push origin feature --force',
            'git commit -m "fix: resolve logout issues" && git push origin bugfix --force',
            'git commit -m "feat: implement OAuth integration" && git push origin integration --force',
            'git commit -m "fix: update security headers" && git push origin security --force',
            'git commit -m "feat: add role-based access" && git push origin permissions --force'
        ]
    },
    {
        id: 'p7',
        title: 'Academic Writing',
        content: 'Furthermore, the empirical evidence substantiates the hypothesis that socioeconomic factors significantly influence outcomes. The data suggests a direct correlation between education level and economic mobility. This finding challenges previous assumptions about social stratification.',
        difficulty: 'Professional',
        category: 'Academic',
        description: 'Practice scholarly language and complex sentence structures.',
        theory: 'Academic writing uses long, connective words (e.g., "furthermore", "substantiates"). These words sustain the flow between complex technical data points.',
        focusKeys: ['f', 'u', 'r', 't', 'h', 'e', 'm', 'o', 's', 'u', 'b', 't', 'a', 'n'],
        warmupSteps: [
            { text: 'furthermore additionally moreover', insight: 'Mastering academic transition words.' },
            { text: 'substan substan substantiates', insight: 'Building complex multi-syllabic verbs.' },
            { text: 'hypothesis socioeconomic factors', insight: 'Social science and theoretical vocabulary.' },
            { text: 'empirical evidence supports', insight: 'Evidence-based discussion phrasing.' },
            { text: 'socioeconomic factors influence outcomes', insight: 'Full academic sentence flow.' }
        ],
        practiceVariations: [
            'Moreover, the empirical evidence substantiates the hypothesis that environmental factors significantly influence outcomes.',
            'Furthermore, the empirical evidence supports the hypothesis that socioeconomic factors significantly influence results.',
            'Additionally, the empirical evidence substantiates the hypothesis that cultural factors significantly influence outcomes.',
            'Moreover, the empirical evidence confirms the hypothesis that socioeconomic factors significantly influence findings.',
            'Furthermore, the empirical evidence validates the hypothesis that psychological factors significantly influence outcomes.',
            'Additionally, the empirical evidence supports the hypothesis that socioeconomic factors significantly influence conclusions.',
            'Moreover, the empirical evidence substantiates the hypothesis that demographic factors significantly influence outcomes.',
            'Furthermore, the empirical evidence confirms the hypothesis that socioeconomic factors significantly influence discoveries.',
            'Additionally, the empirical evidence validates the hypothesis that political factors significantly influence outcomes.',
            'Moreover, the empirical evidence supports the hypothesis that socioeconomic factors significantly influence observations.'
        ]
    },
    {
        id: 'p8',
        title: 'Regex Patterns',
        content: 'const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/; const isValid = emailRegex.test("user+tagged@example.co.uk"); if (!isValid) throw new Error("Invalid format"); const match = "text@domain.com".match(emailRegex);',
        difficulty: 'Professional',
        category: 'Programming',
        description: 'Master regular expressions and escape sequences.',
        theory: 'Regular expressions are the ultimate precision test. They use every symbol and require you to jump between numbers, letters, and brackets without any spaces for relief.',
        focusKeys: ['/', '^', '$', '[', ']', '{', '}', '.', '*', '+', '-', '?', '\\', '|'],
        warmupSteps: [
            { text: '/^ $/ [] {} ()', insight: 'Standard regex boundary symbols.' },
            { text: '[a-z] [A-Z] [0-9]', insight: 'Character class and range calibration.' },
            { text: '{2,} {8,16} \\.', insight: 'Quantifier and escape sequence practice.' },
            { text: 'const emailRegex = / /', insight: 'Integrating regex into code syntax.' },
            { text: '/^[a-zA-Z0-9._%+-]+@/', insight: 'Complex pattern segment burst.' }
        ],
        practiceVariations: [
            'const phoneRegex = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;',
            'const urlRegex = /^https?:\\/\\/[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;',
            'const zipRegex = /^[0-9]{5}(-[0-9]{4})?$/;',
            'const dateRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;',
            'const timeRegex = /^[0-9]{2}:[0-9]{2}:[0-9]{2}$/;',
            'const ipRegex = /^[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}$/;',
            'const hexRegex = /^#[0-9A-Fa-f]{6}$/;',
            'const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;',
            'const usernameRegex = /^[a-zA-Z0-9_-]{3,16}$/;',
            'const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,}$/;'
        ]
    },
    {
        id: 'p9',
        title: 'JSON Structure',
        content: '{"userId": 12345, "name": "John Doe", "email": "john@example.com", "active": true, "roles": ["admin", "editor"], "settings": {"theme": "dark", "notifications": false}, "lastLogin": "2024-01-01T12:00:00Z"}',
        difficulty: 'Professional',
        category: 'Programming',
        description: 'Type structured data formats with perfect syntax.',
        theory: 'JSON requires alternating between quotes, colons, and braces. Focus on the "punctuation rhythm"—the pattern of keystrokes that define the data structure.',
        focusKeys: ['{', '}', '[', ']', '"', ':', ',', 't', 'r', 'u', 'e', 'f', 'a', 'l'],
        warmupSteps: [
            { text: '{"key": "value"}', insight: 'Basic key-value pair calibration.' },
            { text: '"id": 12345, "name":', insight: 'Mixing labels and numeric data.' },
            { text: '"active": true, "list": []', insight: 'Handling booleans and array symbols.' },
            { text: '{"userId": 1, "email": ""}', insight: 'Common user object property flow.' },
            { text: '{"name": "john", "active": true}', insight: 'Full JSON object segment flow.' }
        ],
        practiceVariations: [
            '{"userId": 23456, "name": "Jane Smith", "email": "jane@example.com", "active": false}',
            '{"userId": 34567, "name": "Bob Johnson", "email": "bob@example.com", "active": true}',
            '{"userId": 45678, "name": "Alice Brown", "email": "alice@example.com", "active": true}',
            '{"userId": 56789, "name": "Charlie Davis", "email": "charlie@example.com", "active": false}',
            '{"userId": 67890, "name": "Diana Wilson", "email": "diana@example.com", "active": true}',
            '{"userId": 78901, "name": "Eve Martinez", "email": "eve@example.com", "active": true}',
            '{"userId": 89012, "name": "Frank Garcia", "email": "frank@example.com", "active": false}',
            '{"userId": 90123, "name": "Grace Lee", "email": "grace@example.com", "active": true}',
            '{"userId": 01234, "name": "Henry Taylor", "email": "henry@example.com", "active": true}',
            '{"userId": 11223, "name": "Ivy Anderson", "email": "ivy@example.com", "active": false}'
        ]
    },
    {
        id: 'p10',
        title: 'Professional Paragraph',
        content: 'In the rapidly evolving landscape of modern technology, professionals must continuously adapt their skill sets to remain competitive in virtually every industry. Lifelong learning is no longer optional but a necessity. The integration of AI and automation requires a workforce appearing versatile and resilient.',
        difficulty: 'Professional',
        category: 'Professional',
        description: 'Ultimate speed test with professional-grade content.',
        theory: 'The final professional test requires sustained concentration across a diverse vocabulary. Maintain a consistent WPM and let your hands float naturally over the keys.',
        focusKeys: ['r', 'a', 'p', 'i', 'd', 'l', 'y', 'e', 'v', 'o', 'l', 'v', 'n', 'g'],
        warmupSteps: [
            { text: 'rapidly evolving landscape', insight: 'Advanced professional descriptor flow.' },
            { text: 'continuously adapt skills', insight: 'Dynamic action and capability words.' },
            { text: 'remain competitive industry', insight: 'Market-driven professional vocabulary.' },
            { text: 'professionals must develop', insight: 'Actionable career-oriented phrasing.' },
            { text: 'skill sets to remain competitive', insight: 'Final endurance calibration burst.' }
        ],
        practiceVariations: [
            'In the constantly changing environment of modern business, professionals must continuously develop their capabilities to remain competitive in virtually every sector.',
            'In the rapidly evolving landscape of modern innovation, professionals must continuously enhance their expertise to remain competitive in virtually every field.',
            'In the constantly changing environment of modern commerce, professionals must continuously improve their competencies to remain competitive in virtually every market.',
            'In the rapidly evolving landscape of modern enterprise, professionals must continuously refine their abilities to remain competitive in virtually every domain.',
            'In the constantly changing environment of modern industry, professionals must continuously upgrade their proficiencies to remain competitive in virtually every arena.',
            'In the rapidly evolving landscape of modern organization, professionals must continuously advance their qualifications to remain competitive in virtually every sphere.',
            'In the constantly changing environment of modern workplace, professionals must continuously strengthen their talents to remain competitive in virtually every discipline.',
            'In the rapidly evolving landscape of modern economy, professionals must continuously expand their knowledge to remain competitive in virtually every profession.',
            'In the constantly changing environment of modern society, professionals must continuously build their skills to remain competitive in virtually every occupation.',
            'In the rapidly evolving landscape of modern world, professionals must continuously develop their expertise to remain competitive in virtually every career.'
        ]
    },
    {
        id: 'm1',
        title: 'Clinical SOAP Standard',
        content: 'SUBJECTIVE: Pt presents with persistent 8/10 headaches and photophobia. Reports nausea but no vomiting. OBJECTIVE: BP 130/90, HR 88, Temp 98.6F. PE: Mild temporal tenderness bilaterally. Neuro exam intact. ASSESSMENT: Tension-type headache vs Migraine without aura. PLAN: Naproxen 500 mg po bid prn. Follow up in 3 days if symptoms persist.',
        difficulty: 'Specialist',
        category: 'Medical',
        description: 'Master the standard structure of professional medical reports.',
        theory: 'The SOAP structure (Subjective, Objective, Assessment, Plan) is the universal language of medical documentation. Mastering the transitions between these headers is essential for high-fidelity transcription.',
        focusKeys: ['S', 'O', 'A', 'P', ':', '/', 'm', 'g', 'b', 'i', 'd'],
        warmupSteps: [
            { text: 'SUBJECTIVE: OBJECTIVE: ASSESSMENT:', insight: 'Mastering the primary report headers.' },
            { text: 'Pt presents with persistent', insight: 'Standard patient presentation phrasing.' },
            { text: 'BP 130/90 mmHg 98.6F', insight: 'Vital sign notation and numeric precision.' },
            { text: 'Tension-type headache diagnosed', insight: 'Clinical assessment terminology flow.' },
            { text: 'Naproxen 500 mg po bid', insight: 'Pharmacological dosage and frequency.' }
        ],
        practiceVariations: [
            'SUBJECTIVE: Pt presents with persistent 6/10 abdominal pain. OBJECTIVE: HR 82. PE: Right lower quadrant tenderness. ASSESSMENT: Appendicitis. PLAN: Referral for surgical consult.',
            'SUBJECTIVE: Pt reports worsening 7/10 back pain. OBJECTIVE: Temp 99.1. PE: Lumbar muscle spasms. ASSESSMENT: Acute lumbar strain. PLAN: Physical therapy evaluation.',
            'SUBJECTIVE: Pt presents with acute 5/10 chest tightness. OBJECTIVE: RR 22. PE: Tachypnea detected. ASSESSMENT: Respiratory distress. PLAN: Continue Albuterol 2.5 mg.'
        ]
    },
    {
        id: 'm2',
        title: 'Pharmacology Precision',
        content: 'Prescribe Lisinopril 10 mg daily for BP control. Trial of Gabapentin 300 mg t.i.d. for peripheral neuropathy. Administer Ceftriaxone 1g IV once for potential infection. Monitor renal function and electrolytes. Discontinue Ibuprofen due to GI upset.',
        difficulty: 'Specialist',
        category: 'Medical',
        description: 'Focus on high-stakes accuracy for drug names and dosing.',
        theory: 'Pharmacology transcription requires zero-error tolerance. Misplacing a decimal or confusing "t.i.d." with "q.i.d." can have critical clinical consequences.',
        focusKeys: ['L', 'G', 'C', 'g', '.', 't', 'i', 'd', 'q', 'v'],
        warmupSteps: [
            { text: 'Lisinopril Gabapentin Ceftriaxone', insight: 'Common pharmacological nomenclature.' },
            { text: '10 mg 300 mg 1 g 25 mcg', insight: 'Metric unit and dosage calibration.' },
            { text: 'daily t.i.d. q.i.d. b.i.d. p.r.n.', insight: 'Frequency abbreviations and punctuation.' },
            { text: 'IV IM PO PR SL SC', insight: 'Route of administration abbreviations.' },
            { text: 'Trial of Gabapentin for neuropathy', insight: 'Clinical rationale and medication flow.' }
        ],
        practiceVariations: [
            'Prescribe Metformin 500 mg b.i.d. Trial of Amlodipine 5 mg daily for hypertension. Administer Morphine 2 mg IV p.r.n.',
            'Prescribe Atorvastatin 20 mg h.s. Trial of Prednisone 10 mg daily taper. Administer Epinephrine 0.3 mg IM stat.',
            'Prescribe Omeprazole 20 mg a.c. Trial of Sertraline 50 mg daily. Administer Insulin Glargine 10 units SC h.s.'
        ]
    },
    {
        id: 'm3',
        title: 'Anatomical Greek & Latin',
        content: 'The musculoskeletal exam shows no signs of sternocleidomastoid strain or gastrocnemius atrophy. Range of motion is full in the glenohumeral joint. Palpation of the metacarpophalangeal joints reveals mild swelling. Exploring the costovertebral angle for tenderness.',
        difficulty: 'Specialist',
        category: 'Medical',
        description: 'Master long-form Latinate anatomical terminology.',
        theory: 'Medical Latin uses complex vowel clusters and long suffixes. Developing a rhythmic "glide" over terms like "sternocleidomastoid" prevents stuttering in your transcription flow.',
        focusKeys: ['s', 't', 'e', 'r', 'n', 'o', 'c', 'l', 'i', 'd', 'm', 'a', 'g', 'u', 's'],
        warmupSteps: [
            { text: 'sterno cleido mastoid', insight: 'Segmenting multi-syllabic anatomical roots.' },
            { text: 'gastro cnemius atrophy', insight: 'Common Greek-based physiological suffixes.' },
            { text: 'musculo skeletal examination', insight: 'Systemic-level terminology calibration.' },
            { text: 'brachio cephalic vasculature', insight: 'Vascular and limb terminology clusters.' },
            { text: 'sternocleidomastoid strain detected', insight: 'Full anatomical term endurance burst.' }
        ],
        practiceVariations: [
            'The neurological exam shows no signs of encephalopathy or cerebellar ataxia.',
            'The cardiovascular exam shows no signs of atherosclerosis or ventricular hypertrophy.',
            'The respiratory exam shows no signs of bronchospasm or pulmonary consolidation.'
        ]
    },
    {
        id: 'm4',
        title: 'Surgical Logic',
        content: 'The patient had a previous cholecystectomy and appendectomy in 2018. Scheduled for elective arthroplasty and rhinoplasty next month. Pre-operative clearance required. Review history of anesthesia complications. Consent obtained for exploratory laparotomy if needed.',
        difficulty: 'Specialist',
        category: 'Medical',
        description: 'Focus on surgical procedure suffixes and instrument logic.',
        theory: 'Surgical procedures are categorized by their suffixes: -ectomy (removal), -ostomy (opening), -plasty (repair). Recognising these patterns allows for faster predictive typing.',
        focusKeys: ['e', 'c', 't', 'o', 'm', 'y', 'p', 'l', 'a', 's', 'r', 'h', 'i', 'n'],
        warmupSteps: [
            { text: 'chole cyst ectomy removal', insight: 'Common surgical removal suffixes.' },
            { text: 'arthro plasty rhino plasty', insight: 'Repair and reconstruction terminology.' },
            { text: 'lapar oscopy colono scopy', insight: 'Diagnostic and visual procedure roots.' },
            { text: 'elective invasive procedure', insight: 'Surgical scheduling and status vocabulary.' },
            { text: 'previous cholecystectomy confirmed', insight: 'Past surgical history sentence flow.' }
        ],
        practiceVariations: [
            'The patient had a previous hysterectomy and thyroidectomy. Scheduled for elective colonoscopy and endoscopy.',
            'The patient had a previous splenectomy and nephrectomy. Scheduled for elective angioplasty and stent placement.',
            'The patient had a previous mastectomy and lumpectomy. Scheduled for elective biopsy and excision.'
        ]
    },
    {
        id: 'm5',
        title: 'High-Stakes Consultation',
        content: 'The consultation confirms acute myocardial infarction requiring immediate intervention. Differential diagnosis includes pulmonary embolism and aortic dissection. STAT EKG required. Activate Cath Lab protocol. Administer Aspirin 325 mg and Nitroglycerin 0.4 mg SL immediately.',
        difficulty: 'Specialist',
        category: 'Medical',
        description: 'Full-length consultation report with zero-error threshold.',
        theory: 'In ER and Cardiology consultations, speed and precision are equally urgent. This module tests your ability to handle high-stress terminology under the pressure of "Sudden Death" accuracy.',
        focusKeys: ['m', 'y', 'o', 'c', 'a', 'r', 'd', 'i', 'l', 'e', 'm', 'b', 's', 'K', 'G'],
        warmupSteps: [
            { text: 'myo cardial in farction', insight: 'Critical cardiac event terminology.' },
            { text: 'pulmon embol aortic dissect', insight: 'Stat differential diagnosis clusters.' },
            { text: 'STAT EKG MRI CT EEG', insight: 'Urgent diagnostic imaging acronyms.' },
            { text: 'differential diagnosis includes', insight: 'Standard clinical reasoning phrasing.' },
            { text: 'acute myocardial infarction confirmed', insight: 'High-stakes clinical report sentence.' }
        ],
        practiceVariations: [
            'The consultation confirms acute cerebrovascular accident. Differential diagnosis includes transient ischemic attack and seizure. STAT MRI required.',
            'The consultation confirms acute diabetic ketoacidosis. Differential diagnosis includes sepsis and metabolic acidosis. STAT labs required.',
            'The consultation confirms acute pulmonary edema. Differential diagnosis includes congestive heart failure and pneumonia. STAT Chest X-ray required.'
        ]
    },
    {
        id: 'l1',
        title: 'Legal: Deposition Dynamics',
        content: 'Q. State your name for the record. A. Jonathan Vance. Q. Are you familiar with the defendant? A. Via professional association only. Q. Describe the nature of this association. A. We worked at the same firm from 2010 to 2015. Q. Did you socialize outside of work? A. No, never.',
        difficulty: 'Specialist',
        category: 'Legal',
        description: 'Master the Q&A markers and speaker identifiers of formal depositions.',
        theory: 'Legal transcripts rely on rapid transitions between Q. (Question) and A. (Answer) markers. Precision here is vital for maintaining the verbatim record.',
        focusKeys: ['Q', '.', 'A', ':', '?', 'J', 'v', 'a', 'n', 'c', 'e'],
        warmupSteps: [
            { text: 'Q. State your name', insight: 'Standard deposition opening sequence.' },
            { text: 'A. Jonathan Vance.', insight: 'Response marker and proper noun calibration.' },
            { text: 'Q. Are you familiar', insight: 'Interrogatory phrasing and punctuation.' },
            { text: 'Via professional association', insight: 'Multi-syllabic legal terminology flow.' },
            { text: 'Q. A. Q. A. Q. A.', insight: 'Rapid marker alternation burst.' }
        ],
        practiceVariations: [
            'Q. Where were you on the night of June 5th? A. I was at my residence. Q. Alone? A. No, with my spouse.',
            'Q. Do you recognize this document? A. Yes, I signed it in 2022. Q. Under duress? A. Not at all.',
            'Q. Can you identify the driver? A. It was a dark sedan. Q. Did you see the plate? A. Only the first three digits.'
        ]
    },
    {
        id: 'l2',
        title: 'Legal: Latin Jurisprudence',
        content: 'The court noted the writ of habeas corpus was filed pro se. Prima facie evidence suggests a breach of fiduciary duty and res ipsa loquitur. The defendant invoked nolo contendere regarding the traffic violation. Amicus curiae briefs must be submitted by the deadline.',
        difficulty: 'Specialist',
        category: 'Legal',
        description: 'Master high-frequency Latin legal terms with complex spelling.',
        theory: 'Latin legalisms often feature unusual vowel clusters (ae, ii, io). Developing a rhythmic "glide" over these terms prevents transcription stutters.',
        focusKeys: ['h', 'a', 'b', 'e', 's', 'c', 'o', 'r', 'p', 'u', 'i', 'm', 'f', 'e'],
        warmupSteps: [
            { text: 'habeas corpus ad subjiciendum', insight: 'The fundamental writ of bodily production.' },
            { text: 'prima facie evidence', insight: 'At first face or preliminary evidence.' },
            { text: 'res ipsa loquitur', insight: 'The thing speaks for itself.' },
            { text: 'pro bono publico', insight: 'For the public good.' },
            { text: 'fiduciary duty breached', insight: 'High-stakes civil litigation terminology.' }
        ],
        practiceVariations: [
            'The judge issued a writ of certiorari following the appeal. The defendant responded pro hac vice for this specific hearing.',
            'The contract was void ab initio. The parties entered a nolle prosequi agreement to settle the dispute.',
            'A guardian ad litem was appointed. The court reviewed the amicus curiae brief regarding the constitutional challenge.'
        ]
    },
    {
        id: 'l3',
        title: 'Legal: Procedural Velocity',
        content: 'IT IS HEREBY ORDERED that the motion for summary judgment is DENIED. Plaintiff shall submit the affidavit of service heretofore mentioned within ten (10) days. Failure to comply will result in sanctions. The Clerk is directed to CLOSE this case administratively pending further review.',
        difficulty: 'Specialist',
        category: 'Legal',
        description: 'Focus on uppercase court orders and procedural logic.',
        theory: 'Court orders often use all-caps for emphasis. Shifting between standard sentence case and sudden block capitals tests your modifier key dexterity.',
        focusKeys: ['I', 'T', 'H', 'E', 'R', 'B', 'Y', 'O', 'D', 'N', '(', ')'],
        warmupSteps: [
            { text: 'IT IS HEREBY ORDERED', insight: 'Formal order commencement sequence.' },
            { text: 'motion for summary judgment', insight: 'High-frequency civil procedure phrasing.' },
            { text: 'affidavit of service', insight: 'Documentary evidence nomenclature.' },
            { text: 'heretofore aforementioned', insight: 'Archaic legal connectors and flow.' },
            { text: 'within ten (10) days', insight: 'Numeric and parenthetical citation logic.' }
        ],
        practiceVariations: [
            'IT IS FURTHER ORDERED that the hearing is STAYED. Defendant shall produce the subpoenaed records aforementioned within five (5) days.',
            'THE COURT FINDS that the petition is GRANTED. All parties must attend the mediation session heretofore scheduled within thirty (30) days.',
            'AND NOW THIS DAY it is ORDERED that the injunction is LIFTED. Counsel shall file the requisite motions aforementioned by noon (12:00 PM).'
        ]
    },
    {
        id: 'l4',
        title: 'Legal: Contractual Precision',
        content: '1.1 DEFINITIONS. "Assets" shall mean all tangible property excluding those items listed in Schedule B. 2.5 LIMITATION OF LIABILITY. Notwithstanding anything to the contrary, the Provider\'s liability shall not exceed the total fees paid. 3.4 FORCE MAJEURE. Neither party shall be liable for delays caused by acts of God.',
        difficulty: 'Specialist',
        category: 'Legal',
        description: 'Practice the dense punctuation and numbering of commercial contracts.',
        theory: 'Contracts use deep nesting and specific quotation logic. Accuracy with decimal-point numbering and "Notwithstanding" clauses is essential.',
        focusKeys: ['1', '.', '2', '"', 'A', 's', 'e', 't', 'N', 'o', 'w', 'i', 'h'],
        warmupSteps: [
            { text: '1.1 2.5 3.10.4 4.2', insight: 'Clause numbering and decimal precision.' },
            { text: '"Assets" "Liabilities" "Parties"', insight: 'Quoted definition identifiers.' },
            { text: 'Notwithstanding the foregoing', insight: 'Conditional contractual logic.' },
            { text: 'tangible property excluding', insight: 'Asset classification vocabulary.' },
            { text: 'LIMITATION OF LIABILITY', insight: 'Risk assessment header rhythm.' }
        ],
        practiceVariations: [
            '3.2 ASSIGNMENT. Neither party shall assign this Agreement without prior written consent. 5.1 GOVERNING LAW. This contract is subject to the laws of NY.',
            '1.4 CONFIDENTIALITY. "Data" includes all proprietary information disclosed. 8.2 INDEMNIFICATION. Party A shall hold Party B harmless...',
            '2.1 TERM. This agreement shall commence on the Effective Date. 6.4 TERMINATION. Either party may terminate with 30-day notice.'
        ]
    },
    {
        id: 'l5',
        title: 'Legal: Courtroom Velocity',
        content: 'Sustained. The objection to the testimony regarding the hearsay exception is consistent with Rule 803. Counsel, please direct your witness to focus on the aforementioned incident. Overruled. The witness will answer the question. Please approach the bench for a sidebar conference.',
        difficulty: 'Specialist',
        category: 'Legal',
        description: 'Simulate high-speed courtroom interactions and evidence rulings.',
        theory: 'Courtroom exchanges require zero-latency typing of complex procedural rulings. "Sustained" and "Overruled" are your primary cadence markers.',
        focusKeys: ['S', 'u', 's', 't', 'a', 'i', 'n', 'e', 'd', 'O', 'b', 'j', 'H', 'e', 'a', 'r'],
        warmupSteps: [
            { text: 'Sustained. Overruled.', insight: 'Judicial ruling cadence.' },
            { text: 'hearsay exception rules', insight: 'Evidentiary standard terminology.' },
            { text: 'consistent with Rule 803', insight: 'Legal code and rule citation.' },
            { text: 'direct your witness', insight: 'Procedural instruction phrasing.' },
            { text: 'aforementioned incident recalled', insight: 'Referential legal descriptors.' }
        ],
        practiceVariations: [
            'Overruled. The witness may answer the question regarding the prior conviction. Counsel, proceed with the line of questioning.',
            'Approach the bench. Is there a stipulation regarding the foundation of this exhibit? Please mark it as Defense Exhibit A.',
            'Off the record. We will take a fifteen minute recess. When we return, the cross-examination of the expert witness will commence.'
        ]
    },
    {
        id: 'sc1',
        title: 'Coding: Functional Architecture',
        content: 'const processData = (items) => items.filter(i => i.active).map(i => ({ ...i, lastSync: new Date().toISOString() })).reduce((acc, curr) => acc + curr.value, 0); export default processData; const memoized = useMemo(() => processData(data), [data]);',
        difficulty: 'Specialist',
        category: 'Coding',
        description: 'Master arrow functions, spread operators, and method chaining.',
        theory: 'Modern JS relies on dense functional patterns. Precision with `=>`, `...`, and `()` within chains is critical for engineering transcription.',
        focusKeys: ['=', '>', '(', ')', '{', '}', '.', 'i', 't', 'e', 'm', 's', 'f', 'l', 't'],
        warmupSteps: [
            { text: 'const arrow = () => {}', insight: 'Functional declaration syntax.' },
            { text: 'items.filter(i => i.val)', insight: 'Collection filtering logic.' },
            { text: 'map(i => ({ ...i }))', insight: 'Immutable object mapping.' },
            { text: 'new Date().toISOString()', insight: 'Utility method invocation.' },
            { text: 'export default function', insight: 'Module export patterns.' }
        ],
        practiceVariations: [
            'const validate = (user) => user.roles.some(r => r === "admin") ? true : false; export const isAdmin = validate;',
            'const calculate = (nums) => nums.reduce((acc, curr) => acc + curr, 0); const result = calculate([1, 2, 3]);',
            'const transform = (str) => str.trim().toLowerCase().split(" ").join("-"); console.log(transform(" Hello World "));'
        ]
    },
    {
        id: 'sc2',
        title: 'Coding: Async Handshakes',
        content: 'async function fetchData(url) { try { const response = await axios.get(url); if (!response.ok) throw new Error("Network response was not ok"); return response.data; } catch (e) { console.error(`Fetch failed: ${e.message}`); throw e; } finally { setLoading(false); } }',
        difficulty: 'Specialist',
        category: 'Coding',
        description: 'Focus on try/catch blocks, await logic, and template literals.',
        theory: 'Asynchronous flows introduce nested control structures. Mastering the rhythm of `try { ... } catch (e) { ... }` ensures clean error handling transcription.',
        focusKeys: ['a', 's', 'y', 'n', 'c', 't', 'r', 'y', 'w', 'a', 'i', 't', '`', '$', '{'],
        warmupSteps: [
            { text: 'async await fetch', insight: 'Asynchronous control keywords.' },
            { text: 'try { } catch (e) { }', insight: 'Exception handling structures.' },
            { text: 'await axios.get(url)', insight: 'External library call pattern.' },
            { text: 'throw new Error(msg)', insight: 'Explicit error propagation.' },
            { text: '`${variable}` interpolation', insight: 'Template literal character clusters.' }
        ],
        practiceVariations: [
            'async function login(creds) { try { const user = await auth.signIn(creds); return user; } catch (err) { console.error(err); } }',
            'const save = async (data) => { const res = await db.save(data); if (!res.ok) throw res.error; return res.id; };',
            'async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); } await sleep(1000);'
        ]
    },
    {
        id: 'sc3',
        title: 'Coding: Regex Validation',
        content: 'const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/; const test = emailRegex.test("user@example.com"); console.log(test); const urlRegex = /https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)/;',
        difficulty: 'Specialist',
        category: 'Coding',
        description: 'Master complex escape sequences and quantifier syntax.',
        theory: 'Regular Expressions are the ultimate test of symbol precision. Every slash, bracket, and quantifier must be perfect.',
        focusKeys: ['/', '^', '$', '+', '[', ']', '{', '}', '\\', '|', '@', '.', '?', '*'],
        warmupSteps: [
            { text: '/^[a-z]+$/', insight: 'Boundary and alpha quantifiers.' },
            { text: '\\d{3}-\\d{2}-\\d{4}', insight: 'Escaped digit and range logic.' },
            { text: '(group1|group2)', insight: 'Capture group and alternation.' },
            { text: 'test() exec() match()', insight: 'Regex method invocation.' },
            { text: 'g i m u y global/case', insight: 'Regex modifier suffixing.' }
        ],
        practiceVariations: [
            'const phone = /^\\(\\d{3}\\) \\d{3}-\\d{4}$/; const isPhone = phone.test("(555) 123-4567");',
            'const hex = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/; const isValid = hex.test("#fff");',
            'const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/; const ok = slug.test("hello-world-2024");'
        ]
    },
    {
        id: 'sc4',
        title: 'Coding: Deep Navigation',
        content: 'const config = data?.settings?.profile?.preferences?.theme || "dark"; const activeUsers = users.flatMap(u => u.sessions).filter(s => s.status === "active").length; const mainColor = theme?.colors?.primary ?? "#000000"; const hasFeature = user?.permissions?.includes("beta") ?? false;',
        difficulty: 'Specialist',
        category: 'Coding',
        description: 'Focus on optional chaining, nullish coalescing, and flatMaps.',
        theory: 'Modern data transformation often involves deeply nested property access. Precision with `?.` and `??` prevents runtime crashes in transcription flow.',
        focusKeys: ['?', '.', '|', 'f', 'l', 'a', 't', 'M', 'a', 'p', '"', 's', 't', 'a', 't'],
        warmupSteps: [
            { text: 'data?.profile?.id', insight: 'Safe navigation navigation.' },
            { text: 'theme ?? "default"', insight: 'Nullish coalescing fallback.' },
            { text: 'flatMap(u => u.tags)', insight: 'Iterative array expansion.' },
            { text: 'filter(x => x.active)', insight: 'Conditional logic chaining.' },
            { text: '.reduce(acc => acc, 0)', insight: 'Complex accumulator rhythm.' }
        ],
        practiceVariations: [
            'const status = response?.body?.user?.isActive ?? false; if (!status) return null;',
            'const tags = posts.flatMap(p => p.categories).filter((v, i, a) => a.indexOf(v) === i);',
            'const total = orders.filter(o => !o.cancelled).map(o => o.amount).reduce((a, b) => a + b, 0);'
        ]
    },
    {
        id: 'sc5',
        title: 'Coding: System Interface',
        content: 'interface UserProfile { id: string; settings: { notifications: boolean; theme: "light" | "dark" | "system"; }; lastActive: number; } class SystemController implements IController { constructor(private service: Service) {} async init() { await this.service.connect(); } }',
        difficulty: 'Specialist',
        category: 'Coding',
        description: 'Practice TypeScript interfaces and class implementations.',
        theory: 'Strong typing requires verbose structural definitions. Correctly nesting objects within interfaces builds structural accuracy.',
        focusKeys: [':', ';', '|', '{', '}', 'i', 'n', 't', 'e', 'r', 'f', 'a', 'c', 'e'],
        warmupSteps: [
            { text: 'interface AppProps { }', insight: 'Structural contract definition.' },
            { text: 'boolean number string', insight: 'Primitive type identifiers.' },
            { text: '"on" | "off" | "auto"', insight: 'Union type literal clusters.' },
            { text: 'class Controller { }', insight: 'Object-oriented blueprinting.' },
            { text: 'implements IAction', insight: 'Interface enforcement keywords.' }
        ],
        practiceVariations: [
            'type Status = "pending" | "fulfilled" | "rejected"; interface Result { id: number; status: Status; data?: any; }',
            'class Database extends Service { constructor(config) { super(config); this.connected = false; } }',
            'export interface Theme { colors: { primary: string; secondary: string; background: string; }; spacing: number[]; }'
        ]
    },
    {
        id: 'j1',
        title: 'Journalism: The Newsroom Pulse',
        content: 'LONDON, UK — The Prime Minister issued a statement regarding the unilateral ceasefire. "We remain committed to peace," the spokesperson confirmed at 10:00 PM GMT. Opposition leaders, however, demand immediate clarification on the terms of the agreement. Global markets reacted cautiously as trading opened this morning.',
        difficulty: 'Specialist',
        category: 'Journalism',
        description: 'Master datelines, attribution, and time/location markers.',
        theory: 'News reporting requires rapid switching between absolute locations (datelines) and direct speech. Precision with dashes and quotes is vital for verbatim reporting.',
        focusKeys: ['L', 'O', 'N', 'D', '—', '"', ':', 'G', 'M', 'T'],
        warmupSteps: [
            { text: 'WASHINGTON, DC —', insight: 'Standard dateline format with em-dash.' },
            { text: '"Quotes within quotes"', insight: 'Attribution marker calibration.' },
            { text: '10:00 AM EST 12:00 PM', insight: 'Time zone and numeric precision.' },
            { text: 'spokesperson confirmed via', insight: 'High-frequency reporting verbs.' },
            { text: 'The Prime Minister stated', insight: 'Formal title capitalization flow.' }
        ],
        practiceVariations: [
            'TOKYO, JAPAN — Markets plummeted today following the emergency announcement. "Volatility is expected," the Finance Minister noted at 09:30 AM.',
            'PARIS, FRANCE — Protests erupted at the city center. "We will not yield," a representative said during the live broadcast at midnight JST.',
            'BERLIN, GERMANY — The summit concluded with a joint declaration. "Unity is paramount," the Chancellor remarked at 4:15 PM CET.'
        ]
    },
    {
        id: 'j2',
        title: 'Journalism: Headline Velocity',
        content: 'BREAKING: BREAKDOWN IN NEGOTIATIONS AS CRISIS DEEPENS. INTERNAL MEMO LEAKED; OFFICIALS DENY ANY WRONGDOING. INVESTIGATION PENDING. STOCK MARKET PLUNGES 500 POINTS AMID UNCERTAINTY. CITIZENS URGED TO REMAIN CALM DURING EMERGENCY PROTOCOLS.',
        difficulty: 'Specialist',
        category: 'Journalism',
        description: 'Practice high-pressure all-caps headlines and subheaders.',
        theory: 'Headlines use block capitals and concise punctuation. Maintaining high speed in ALL CAPS tests your shift key stamina and rhythmic consistency.',
        focusKeys: ['B', 'R', 'E', 'A', 'K', 'I', 'N', 'G', ':', ';', '.', ' '],
        warmupSteps: [
            { text: 'BREAKING NEWS ALERT', insight: 'Urgent header burst sequence.' },
            { text: 'CRISIS DEEPENS SUDDENLY', insight: 'Aggressive block capital flow.' },
            { text: 'NEGOTIATIONS STALLED;', insight: 'Semicolons in headline structures.' },
            { text: 'OFFICIALS DENY ALL CLAIMS', insight: 'Standard denial terminology.' },
            { text: 'INVESTIGATION PENDING NOW', insight: 'Procedural subheader rhythm.' }
        ],
        practiceVariations: [
            'FLASH: UNEMPLOYMENT FALLS TO RECORD LOW. CONSUMER CONFIDENCE INDEX SURGES; ECONOMISTS REMAIN CAUTIOUS.',
            'DEVELOPING: MAJOR CYBERATTACK TARGETS GRID. SECURITY FIRMS DEPLOY PATCH; NO DATA BREACH CONFIRMED YET.',
            'EXCLUSIVE: WHISTLEBLOWER EXPOSES SYSTEMIC FRAUD. CEO RESIGNS EFFECTIVE IMMEDIATELY; BOARD SEEKING SUCCESSOR.'
        ]
    },
    {
        id: 'j3',
        title: 'Journalism: Narrative Flow',
        content: 'Witnesses described the scene as "chaotic but controlled." Under the heavy rain, the crowd gathered outside the courthouse, awaiting the verdict that would define a generation. Reporters stood ready, microphones in hand, as the heavy oak doors slowly creaked open. A hush fell over the square.',
        difficulty: 'Specialist',
        category: 'Journalism',
        description: 'Focus on descriptive prose and complex sentence structures.',
        theory: 'Feature journalism blends reporting with narrative flair. Mastering the transition between dialogue tags and descriptive clauses improves literary typing.',
        focusKeys: ['W', 'i', 't', 'n', 'e', 's', '"', 'c', 'h', 'a', 'o', ',', '.'],
        warmupSteps: [
            { text: '"chaotic but controlled"', insight: 'Quoted descriptive descriptors.' },
            { text: 'awaiting the verdict...', insight: 'Ellipsis and suspenseful flow.' },
            { text: 'outside the courthouse,', insight: 'Locational clause punctuation.' },
            { text: 'defined a generation.', insight: 'Polished ending phrasing.' },
            { text: 'heavy rain falling down', insight: 'Descriptive adjective clusters.' }
        ],
        practiceVariations: [
            'The atmosphere was "electric" as the countdown began. Thousands stood in silence, reflecting on the historical significance of the event.',
            'Rarely has a speaker moved a crowd with such "ferocious grace." Her words echoed through the hall, sparking a movement that spread nationwide.',
            'The abandoned site felt "frozen in time." Nature had begun to reclaim the steel beams, weaving green vines through the industrial skeleton.'
        ]
    },
    {
        id: 'j4',
        title: 'Journalism: Statistical Precision',
        content: 'The 12.5% increase in GDP surprised analysts, who had predicted a mere 0.3% growth. Meanwhile, the $1.2B surplus will be allocated to infrastructure projects. Consumer spending rose by 4.2% in Q3, while inflation stabilized at 2.1%. The unemployment rate dropped to a historic low of 3.5%.',
        difficulty: 'Specialist',
        category: 'Journalism',
        description: 'Practice dense financial reporting data.',
        theory: 'Economic reporting requires extreme precision with percentages and currency symbols. Mis-typing a decimal point changes the entire story.',
        focusKeys: ['1', '2', '.', '5', '%', '$', 'B', 'G', 'D', 'P'],
        warmupSteps: [
            { text: '12.5% increase 0.3%', insight: 'Decimal and percentage accuracy.' },
            { text: '$1.2B surplus $500M', insight: 'Currency and magnitude markers.' },
            { text: 'predicted growth rates', insight: 'Economic forecast terminology.' },
            { text: 'infrastructure projects', insight: 'Administrative expenditure flow.' },
            { text: 'GDP surge analysts say', insight: 'Market reaction phrasing.' }
        ],
        practiceVariations: [
            'Inflation hit a 40-year high of 9.1% in Q3. The Federal Reserve responded with a 75-basis-point hike, targeting a 2% long-term goal.',
            'The tech giant reported a $4.5B loss this quarter. Shares fell 18.2% in after-hours trading as investors reacted to the news.',
            'A 5-year study showed a 33.4% reduction in carbon emissions. The government pledged $10B toward renewable energy by 2030.'
        ]
    },
    {
        id: 'j5',
        title: 'Journalism: Interview Cadence',
        content: 'Q: How do you respond to the allegations? A: They are baseless. Q: Baseless? We have the documents. A: Then the documents are forgeries. Q: Are you accusing the whistleblower of lying? A: I am stating that the evidence is fabricated. Q: Will you resign? A: Absolutely not.',
        difficulty: 'Specialist',
        category: 'Journalism',
        description: 'Practice the rapid back-and-forth of hard-hitting interviews.',
        theory: 'Interviews use Q: and A: markers to denote speaker changes. This builds on the legal deposition rhythm but with shorter, more aggressive exchanges.',
        focusKeys: ['Q', ':', ' ', 'A', '?', '.', 'b', 'a', 's', 'e', 'l', 's'],
        warmupSteps: [
            { text: 'Q: How do you respond?', insight: 'Interrogative speaker marker.' },
            { text: 'A: No further comment.', insight: 'Defensive response marker.' },
            { text: 'Q: Baseless? A: Yes.', insight: 'Rapid-fire short alternation.' },
            { text: 'We have the documents.', insight: 'Assertive evidentiary statement.' },
            { text: 'forgeries and lies', insight: 'Contrastive terminology flow.' }
        ],
        practiceVariations: [
            'Q: Why now? A: Because the truth matters. Q: And before? A: I was constrained. Q: By whom? A: My contract.',
            'Q: Can you confirm the location? A: No. Q: Why not? A: Operational security. Q: Is there a threat? A: Always.',
            'Q: Is the deal dead? A: It is on life support. Q: Who pulled the plug? A: The board. Q: Unanimously? A: Yes.'
        ]
    },
    {
        id: 'd1',
        title: 'DevOps: Pipeline Command',
        content: 'docker build -t app:v1 . && docker push registry.internal/app:v1; kubectl apply -f ./k8s/deployment.yaml --namespace=production --validate=false; helm upgrade --install my-release ./charts/my-chart --set replicaCount=3; echo "Deploy Success" | mail -s "Status" admin@corp.com',
        difficulty: 'Specialist',
        category: 'DevOps',
        description: 'Master containerization and orchestration commands.',
        theory: 'DevOps requires zero-mistake typing of complex shell strings. Mixing `&&`, `;`, `-t`, and `./` paths tests your technical precision.',
        focusKeys: ['d', 'o', 'c', 'k', 'e', 'r', '-', 't', '.', '&', 'k', 'u', 'b', 'e', 'c', 't', 'l'],
        warmupSteps: [
            { text: 'docker build -t app', insight: 'Container build command pattern.' },
            { text: '&& docker push registry', insight: 'Chained command execution.' },
            { text: 'kubectl apply -f yaml', insight: 'Orchestration manifest application.' },
            { text: '--namespace=production', insight: 'Long-form flag and equal sign logic.' },
            { text: './k8s/deploy.yaml', insight: 'Relative directory path navigation.' }
        ],
        practiceVariations: [
            'docker images --format="{{.Repository}}: {{.Tag}}" | grep "none"; docker rmi $(docker images -q -f dangling=true)',
            'kubectl get pods -l app=nginx -o json; kubectl logs -f deploy/api-service --tail=100 -n staging',
            'docker-compose up -d --build; docker exec -it db-1 psql -U postgres -d analytics_db'
        ]
    },
    {
        id: 'd2',
        title: 'DevOps: Infrastructure as Code',
        content: 'resource "aws_instance" "web" { ami = "ami-0c55b159cbfafe1f0" instance_type = "t2.micro" tags = { Name = "ProdServer" } vpc_security_group_ids = ["sg-12345678"] subnet_id = "subnet-87654321" key_name = "deploy-key" root_block_device { volume_size = 20 } }',
        difficulty: 'Specialist',
        category: 'DevOps',
        description: 'Focus on HCL (HashiCorp Configuration Language) syntax.',
        theory: 'IaC involves structured blocks, quotes, and specific resource identifiers. Precision with braces `{}` and equals signs `=` is critical for cloud automation.',
        focusKeys: ['r', 'e', 's', 'o', 'u', 'r', 'c', '"', '{', '}', '=', 'a', 'm', 'i'],
        warmupSteps: [
            { text: 'resource "aws_s3_bucket"', insight: 'Cloud resource definition pattern.' },
            { text: 'instance_type = "t2"', insight: 'Attribute assignment syntax.' },
            { text: 'tags = { Env = "Dev" }', insight: 'Nested map and metadata labels.' },
            { text: 'terraform init && apply', insight: 'IaC lifecycle command flow.' },
            { text: '"ami-0c55b159cbfa"', insight: 'Hexadecimal identifier accuracy.' }
        ],
        practiceVariations: [
            'variable "db_pwd" { description = "Secret" type = string sensitive = true }; output "lb_ip" { value = aws_lb.ext.dns }',
            'module "vpc" { source = "./modules/vpc" cidr = "10.0.0.0/16" azs = ["us-east-1a", "us-east-1b"] }',
            'locals { common_tags = { Owner = "Ops" Project = "Nexus" } }; resource "aws_db" { tags = local.common_tags }'
        ]
    },
    {
        id: 'd3',
        title: 'DevOps: Terminal Gymnastics',
        content: 'find /var/log -name "*.log" -mtime +30 -exec rm -rf {} \\; | awk \'{print $9}\' | sort | uniq -c | head -n 5; ps aux | grep "node" | awk \'{print $2}\' | xargs kill -9; du -sh /home/* | sort -rh | grep "G" | tee large_folders.txt',
        difficulty: 'Specialist',
        category: 'DevOps',
        description: 'Master complex Unix pipelines and file manipulations.',
        theory: 'Terminal work uses heavy redirection and piping. Correctly escaping characters like `\\;` and using single quotes for `awk` is the mark of an expert.',
        focusKeys: ['/', '*', '.', '+', '-', '\\', ';', '|', '`', '\'', '{', '}'],
        warmupSteps: [
            { text: 'find / -name "*.tmp"', insight: 'System-wide file search syntax.' },
            { text: '-exec rm -rf {} \\;', insight: 'Escaped sub-command termination.' },
            { text: 'awk \'{print $1}\' | sort', insight: 'Data extraction and pipe logic.' },
            { text: 'uniq -c | head -n 10', insight: 'Summarization and capping filters.' },
            { text: 'grep -rE "error|fail"', insight: 'Regex-enhanced search patterns.' }
        ],
        practiceVariations: [
            'ls -lah /root | sed "s/root/admin/g" > output.txt; cat access.log | grep 404 | cut -d\' \' -f7 | sort | uniq',
            'ps aux | grep node | awk \'{print $2}\' | xargs kill -9; du -sh /home/* | sort -rh | head -10',
            'chmod +x script.sh && ./script.sh 2>&1 | tee audit.log; lsof -i :8080 | awk \'NR>1 {print $2}\''
        ]
    },
    {
        id: 'd4',
        title: 'DevOps: Scripting Logic',
        content: 'if [[ $? -eq 0 ]]; then echo "Deployment Successful!"; else echo "Deployment Failed!" >&2; exit 1; fi; for i in {1..5}; do curl -I http://localhost:8080 || sleep 1; done; export NODE_ENV=production && npm start',
        difficulty: 'Specialist',
        category: 'DevOps',
        description: 'Focus on Bash conditional logic and status codes.',
        theory: 'Shell scripts rely on `$`, `[[ ]]`, and redirection `>&2`. Speed with these specific symbol clusters is essential for interactive troubleshooting.',
        focusKeys: ['$', '?', '=', '[', ']', ';', 'e', 'c', 'h', 'o', '>', '&', '2'],
        warmupSteps: [
            { text: 'if [[ $status == 0 ]]', insight: 'Bash conditional test syntax.' },
            { text: 'then echo "Success"', insight: 'Positive branch execution.' },
            { text: 'else exit 1; fi', insight: 'Failure branch and closure.' },
            { text: '>&2 redirect to stderr', insight: 'Error stream manipulation.' },
            { text: '$@ for args ${VAR}', insight: 'Variable expansion and params.' }
        ],
        practiceVariations: [
            'for file in *.jpg; do convert "$file" "${file%.jpg}.png"; done; while read p; do echo "Processing $p"; done < list.txt',
            'case "$ENV" in "prod") deploy_prod ;; "test") deploy_test ;; *) echo "Unknown" ; exit 1 esac',
            'export PATH=$PATH:~/bin; alias gs="git status"; function l() { ls -CF "$@" }'
        ]
    },
    {
        id: 'd5',
        title: 'DevOps: Config YAML',
        content: 'apiVersion: v1\nkind: Service\nmetadata:\n  name: api-gateway\nspec:\n  selector:\n    app: gateway\n  ports:\n    - protocol: TCP\n      port: 80\n      targetPort: 8080\n  type: LoadBalancer\n  sessionAffinity: ClientIP',
        difficulty: 'Specialist',
        category: 'DevOps',
        description: 'Practice the strict indentation and key-value mapping of YAML.',
        theory: 'YAML uses whitespace and colons for structure. Maintaining alignment across nested keys like `spec > ports > - protocol` is vital for readability.',
        focusKeys: [':', '\n', ' ', '-', 'k', 'i', 'n', 'd', 'p', 'o', 'r', 't'],
        warmupSteps: [
            { text: 'apiVersion: v1', insight: 'Standard Kubernetes header.' },
            { text: '  name: my-app', insight: 'Two-space indentation rule.' },
            { text: '  ports: - port: 80', insight: 'List item within a map.' },
            { text: 'targetPort: 8080', insight: 'Backend service port mapping.' },
            { text: 'selector: app: web', insight: 'Label-based resource discovery.' }
        ],
        practiceVariations: [
            'image: node:18-alpine\nworkingDir: /app\ncommand: ["npm", "start"]\nenv:\n  - name: PORT\n    value: "3000"',
            'strategy:\n  type: RollingUpdate\n  rollingUpdate:\n    maxSurge: 25%\n    maxUnavailable: 25%',
            'securityContext:\n  runAsUser: 1000\n  fsGroup: 2000\n  capabilities:\n    add: ["NET_ADMIN", "SYS_TIME"]'
        ]
    },
    {
        id: 'g1',
        title: 'Gaming: Tactical Comms',
        content: 'Enemy spotted at Long A! Flashbang going out. Bomb has been planted at B Site. Rotation incoming, watch the flank! Sniper in the window. Smoke the cross. One enemy remaining in the pit. Defusing now, cover me! GG well played.',
        difficulty: 'Specialist',
        category: 'Gaming',
        description: 'Master the high-speed jargon of tactical shooters.',
        theory: 'Tactical comms require rapid, clear typing of location-based callouts. Precision under pressure with high-frequency abbreviations like "Long A" is key.',
        focusKeys: ['E', 'n', 'e', 'm', 'y', 'L', 'o', 'n', 'g', 'A', '!', 'B', 'f', 'l', 'a', 'n', 'k'],
        warmupSteps: [
            { text: 'Enemy at Long A!', insight: 'Standard combat callout burst.' },
            { text: 'Bomb planted at B', insight: 'Objective status notification.' },
            { text: 'Rotation in 5s!', insight: 'Strategic movement timing.' },
            { text: 'Flashbang out!', insight: 'Utility usage notification.' },
            { text: 'Watch the flank!', insight: 'Positioning awareness alert.' }
        ],
        practiceVariations: [
            'Need healing at Mid! Shield down, retreat to spawn. One tap on the sniper, pushing now!',
            'Planting at A. Smokes are down, holding the corner. Defuser is in the smoke, protect it!',
            'Eco round, don\'t buy. Stack B site, they will rush. Ready for retake, let\'s go!'
        ]
    },
    {
        id: 'g2',
        title: 'Gaming: Raid Coordinates',
        content: 'Tank swap at 50%. Focus the adds at West door. Boss transitioning to Phase 2. Stack on the marker (Red Circle) for the AoE! Healers pop cooldowns now. Spread out for the meteor. Interrupt the cast! Battle res the tank.',
        difficulty: 'Specialist',
        category: 'Gaming',
        description: 'Practice the complex coordination of MMO raid messaging.',
        theory: 'Raid leaders must type precise instructions and percentages. Correctly formatting markers like "(Red Circle)" and "Phase 2" ensures clear team coordination.',
        focusKeys: ['T', 'a', 'n', 'k', '%', 'W', 'e', 's', 't', '(', ')', 'A', 'o', 'E'],
        warmupSteps: [
            { text: 'Tank swap at 30%', insight: 'Percentage-based mechanic trigger.' },
            { text: 'Focus adds now!', insight: 'Priority target directive.' },
            { text: 'Stack on Blue!', insight: 'Positioning instruction burst.' },
            { text: 'Phase 3 incoming!', insight: 'Progression state warning.' },
            { text: '(Star Marker)', insight: 'Visual indicator citation.' }
        ],
        practiceVariations: [
            'Healers focus the MT! Dps stop at 1%. Burn the boss down, no more distractions!',
            'Spread for the debuff. Move to South-East quadrant. Wait for the dispel, don\'t move!',
            'Boss is enraged! Pop all cooldowns. 5% left, finish it. Good job everyone.'
        ]
    },
    {
        id: 'g3',
        title: 'Gaming: Pro eSports Jargon',
        content: 'That\'s a huge GG! The meta is shifting toward aggressive rotations. Clutch play at the tie-breaker. MVP performance from the carry. The crowd goes wild as the underdogs take the trophy. Unbelievable mechanical skill on display.',
        difficulty: 'Specialist',
        category: 'Gaming',
        description: 'Master the specialized vocabulary of competitive gaming.',
        theory: 'Competitive gaming has its own shorthand (GG, MVP, Carry). Developing a rhythm for these uppercase abbreviations within standard sentences improves commentary typing.',
        focusKeys: ['G', 'G', 'M', 'V', 'P', 'm', 'e', 't', 'a', 'c', 'l', 'u', 't', 'c', 'h'],
        warmupSteps: [
            { text: 'Huge GG everyone!', insight: 'Post-match etiquette burst.' },
            { text: 'current meta shifts', insight: 'Balance and strategy terminology.' },
            { text: 'clutch play confirmed', insight: 'High-performance descriptor.' },
            { text: 'MVP carry performance', insight: 'Role and award nomenclature.' },
            { text: 'tie-breaker intensity', insight: 'Tournament structure phrasing.' }
        ],
        practiceVariations: [
            'The jungler is ganking top. Secure the objective, we need the gold lead. Turret is down!',
            'Don\'t feed the hyper-carry. We need more crowd control. Team-fight at the pit in 10!',
            'The bracket reset is real. Who will win the grand finals? The hype is unreal right now.'
        ]
    },
    {
        id: 'g4',
        title: 'Gaming: System & Bindings',
        content: '/bind k "say Rush B!". sensitivity 2.5; cl_interp 0; voice_enable 1. bind mwheelup +jump; fps_max 144. rate 128000; cl_cmdrate 128; cl_updaterate 128; net_graph 1. alias +jumpthrow "+jump;-attack"; bind v +jumpthrow',
        difficulty: 'Specialist',
        category: 'Gaming',
        description: 'Practice console commands and keybinding syntax.',
        theory: 'Power users use the developer console for optimization. Precision with forward slashes `/`, underscores `_`, and quotes `"` is vital for config accuracy.',
        focusKeys: ['/', 'b', 'i', 'n', 'd', '"', '_', ';', '0', '1', 'f', 'p', 's'],
        warmupSteps: [
            { text: '/say Hello World!', insight: 'Slash command invocation.' },
            { text: 'bind k "action"', insight: 'Hotkey assignment syntax.' },
            { text: 'cl_showfps 1', insight: 'Settings toggle underscore logic.' },
            { text: 'sensitivity 1.5;', insight: 'Numeric value and semicolon.' },
            { text: 'fps_max 144.0', insight: 'Hardware limit numeric precision.' }
        ],
        practiceVariations: [
            'alias +crouchjump "+jump;+duck"; bind space +crouchjump; crosshair 1; volume 0.5',
            'net_graph 1; rate 786432; cl_cmdrate 128; echo "Config Loaded Success"',
            '/invite "Player123"; /kick @cheater; /mute all; dev_console 1'
        ]
    },
    {
        id: 'g5',
        title: 'Gaming: Velocity Cast',
        content: 'He\'s around the corner, he\'s low, he\'s absolutely one-shot! The flank is real! Can he find the opening? Yes! Unbelievable reactions! The map control is completely in their favor. It all comes down to this final round.',
        difficulty: 'Specialist',
        category: 'Gaming',
        description: 'Simulate the frenetic pace of live shoutcasting.',
        theory: 'Casting requires rapid sentences with emotional punctuation. "He\'s" and "Yes!" are your cadence markers for this high-velocity scenario.',
        focusKeys: ['h', 'e', '\'', 's', '!', '?', 'Y', 'e', 's', 'U', 'n', 'b', 'e', 'l'],
        warmupSteps: [
            { text: 'He\'s absolutely low!', insight: 'High-energy player status burst.' },
            { text: 'Unbelievable play!', insight: 'Signature casting exclamative.' },
            { text: 'The flank is real!', insight: 'Positional storytelling phrasing.' },
            { text: 'Can he find it?', insight: 'Suspenseful interrogative rhythm.' },
            { text: 'Opening found now!', insight: 'Action resolution notification.' }
        ],
        practiceVariations: [
            'The crowd is going wild! Incredible precision with the headshot. He is unstoppable right now!',
            'Down to the wire. 1v3 situation, can he clutch this out? He does it! The greatest of all time!',
            'Look at the movement! Dancing through the fire. He secures the double kill and the round!'
        ]
    }
];
