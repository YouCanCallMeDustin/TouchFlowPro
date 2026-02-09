export interface BibleVerse {
    book: string;
    chapter: number;
    verse: number;
    text: string;
    reference: string;
}

export interface BibleChapter {
    book: string;
    chapter: number;
    verses: BibleVerse[];
}

export interface BibleBook {
    name: string;
    abbreviation: string;
    chapters: BibleChapter[];
    icon: string;
}

// ESV New Testament Verses
export const bibleBooks: BibleBook[] = [
    {
        name: "Matthew",
        abbreviation: "Matt",
        icon: "📖",
        chapters: [
            {
                book: "Matthew",
                chapter: 5,
                verses: [
                    { book: "Matthew", chapter: 5, verse: 3, text: "Blessed are the poor in spirit, for theirs is the kingdom of heaven.", reference: "Matthew 5:3" },
                    { book: "Matthew", chapter: 5, verse: 4, text: "Blessed are those who mourn, for they shall be comforted.", reference: "Matthew 5:4" },
                    { book: "Matthew", chapter: 5, verse: 5, text: "Blessed are the meek, for they shall inherit the earth.", reference: "Matthew 5:5" },
                    { book: "Matthew", chapter: 5, verse: 6, text: "Blessed are those who hunger and thirst for righteousness, for they shall be satisfied.", reference: "Matthew 5:6" },
                    { book: "Matthew", chapter: 5, verse: 7, text: "Blessed are the merciful, for they shall receive mercy.", reference: "Matthew 5:7" },
                    { book: "Matthew", chapter: 5, verse: 8, text: "Blessed are the pure in heart, for they shall see God.", reference: "Matthew 5:8" },
                    { book: "Matthew", chapter: 5, verse: 9, text: "Blessed are the peacemakers, for they shall be called sons of God.", reference: "Matthew 5:9" },
                    { book: "Matthew", chapter: 5, verse: 10, text: "Blessed are those who are persecuted for righteousness' sake, for theirs is the kingdom of heaven.", reference: "Matthew 5:10" },
                    { book: "Matthew", chapter: 5, verse: 14, text: "You are the light of the world. A city set on a hill cannot be hidden.", reference: "Matthew 5:14" },
                    { book: "Matthew", chapter: 5, verse: 16, text: "In the same way, let your light shine before others, so that they may see your good works and give glory to your Father who is in heaven.", reference: "Matthew 5:16" },
                ]
            },
            {
                book: "Matthew",
                chapter: 6,
                verses: [
                    { book: "Matthew", chapter: 6, verse: 9, text: "Pray then like this: Our Father in heaven, hallowed be your name.", reference: "Matthew 6:9" },
                    { book: "Matthew", chapter: 6, verse: 10, text: "Your kingdom come, your will be done, on earth as it is in heaven.", reference: "Matthew 6:10" },
                    { book: "Matthew", chapter: 6, verse: 11, text: "Give us this day our daily bread,", reference: "Matthew 6:11" },
                    { book: "Matthew", chapter: 6, verse: 12, text: "and forgive us our debts, as we also have forgiven our debtors.", reference: "Matthew 6:12" },
                    { book: "Matthew", chapter: 6, verse: 13, text: "And lead us not into temptation, but deliver us from evil.", reference: "Matthew 6:13" },
                    { book: "Matthew", chapter: 6, verse: 19, text: "Do not lay up for yourselves treasures on earth, where moth and rust destroy and where thieves break in and steal,", reference: "Matthew 6:19" },
                    { book: "Matthew", chapter: 6, verse: 20, text: "but lay up for yourselves treasures in heaven, where neither moth nor rust destroys and where thieves do not break in and steal.", reference: "Matthew 6:20" },
                    { book: "Matthew", chapter: 6, verse: 21, text: "For where your treasure is, there your heart will be also.", reference: "Matthew 6:21" },
                    { book: "Matthew", chapter: 6, verse: 33, text: "But seek first the kingdom of God and His righteousness, and all these things will be added to you.", reference: "Matthew 6:33" },
                    { book: "Matthew", chapter: 6, verse: 34, text: "Therefore do not be anxious about tomorrow, for tomorrow will be anxious for itself. Sufficient for the day is its own trouble.", reference: "Matthew 6:34" },
                ]
            },
            {
                book: "Matthew",
                chapter: 7,
                verses: [
                    { book: "Matthew", chapter: 7, verse: 7, text: "Ask, and it will be given to you; seek, and you will find; knock, and it will be opened to you.", reference: "Matthew 7:7" },
                    { book: "Matthew", chapter: 7, verse: 8, text: "For everyone who asks receives, and the one who seeks finds, and to the one who knocks it will be opened.", reference: "Matthew 7:8" },
                    { book: "Matthew", chapter: 7, verse: 12, text: "So whatever you wish that others would do to you, do also to them, for this is the Law and the Prophets.", reference: "Matthew 7:12" },
                    { book: "Matthew", chapter: 7, verse: 24, text: "Everyone then who hears these words of mine and does them will be like a wise man who built his house on the rock.", reference: "Matthew 7:24" },
                ]
            },
            {
                book: "Matthew",
                chapter: 11,
                verses: [
                    { book: "Matthew", chapter: 11, verse: 28, text: "Come to me, all who labor and are heavy laden, and I will give you rest.", reference: "Matthew 11:28" },
                    { book: "Matthew", chapter: 11, verse: 29, text: "Take my yoke upon you, and learn from me, for I am gentle and lowly in heart, and you will find rest for your souls.", reference: "Matthew 11:29" },
                    { book: "Matthew", chapter: 11, verse: 30, text: "For my yoke is easy, and my burden is light.", reference: "Matthew 11:30" },
                ]
            },
            {
                book: "Matthew",
                chapter: 28,
                verses: [
                    { book: "Matthew", chapter: 28, verse: 18, text: "And Jesus came and said to them, All authority in heaven and on earth has been given to me.", reference: "Matthew 28:18" },
                    { book: "Matthew", chapter: 28, verse: 19, text: "Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit,", reference: "Matthew 28:19" },
                    { book: "Matthew", chapter: 28, verse: 20, text: "teaching them to observe all that I have commanded you. And behold, I am with you always, to the end of the age.", reference: "Matthew 28:20" },
                ]
            }
        ]
    },
    {
        name: "Mark",
        abbreviation: "Mark",
        icon: "🦁",
        chapters: [
            {
                book: "Mark",
                chapter: 1,
                verses: [
                    { book: "Mark", chapter: 1, verse: 1, text: "The beginning of the gospel of Jesus Christ, the Son of God.", reference: "Mark 1:1" },
                    { book: "Mark", chapter: 1, verse: 15, text: "The time is fulfilled, and the kingdom of God is at hand; repent and believe in the gospel.", reference: "Mark 1:15" },
                    { book: "Mark", chapter: 1, verse: 17, text: "And Jesus said to them, Follow me, and I will make you become fishers of men.", reference: "Mark 1:17" },
                ]
            },
            {
                book: "Mark",
                chapter: 4,
                verses: [
                    { book: "Mark", chapter: 4, verse: 39, text: "And He awoke and rebuked the wind and said to the sea, Peace! Be still! And the wind ceased, and there was a great calm.", reference: "Mark 4:39" },
                    { book: "Mark", chapter: 4, verse: 40, text: "He said to them, Why are you so afraid? Have you still no faith?", reference: "Mark 4:40" },
                ]
            },
            {
                book: "Mark",
                chapter: 8,
                verses: [
                    { book: "Mark", chapter: 8, verse: 34, text: "And calling the crowd to Him with His disciples, He said to them, If anyone would come after me, let him deny himself and take up his cross and follow me.", reference: "Mark 8:34" },
                    { book: "Mark", chapter: 8, verse: 35, text: "For whoever would save his life will lose it, but whoever loses his life for my sake and the gospel's will save it.", reference: "Mark 8:35" },
                    { book: "Mark", chapter: 8, verse: 36, text: "For what does it profit a man to gain the whole world and forfeit his soul?", reference: "Mark 8:36" },
                ]
            },
            {
                book: "Mark",
                chapter: 10,
                verses: [
                    { book: "Mark", chapter: 10, verse: 27, text: "Jesus looked at them and said, With man it is impossible, but not with God. For all things are possible with God.", reference: "Mark 10:27" },
                    { book: "Mark", chapter: 10, verse: 45, text: "For even the Son of Man came not to be served but to serve, and to give His life as a ransom for many.", reference: "Mark 10:45" },
                ]
            },
            {
                book: "Mark",
                chapter: 12,
                verses: [
                    { book: "Mark", chapter: 12, verse: 30, text: "And you shall love the Lord your God with all your heart and with all your soul and with all your mind and with all your strength.", reference: "Mark 12:30" },
                    { book: "Mark", chapter: 12, verse: 31, text: "The second is this: You shall love your neighbor as yourself. There is no other commandment greater than these.", reference: "Mark 12:31" },
                ]
            },
            {
                book: "Mark",
                chapter: 16,
                verses: [
                    { book: "Mark", chapter: 16, verse: 6, text: "And he said to them, Do not be alarmed. You seek Jesus of Nazareth, who was crucified. He has risen; He is not here. See the place where they laid Him.", reference: "Mark 16:6" },
                    { book: "Mark", chapter: 16, verse: 15, text: "And He said to them, Go into all the world and proclaim the gospel to the whole creation.", reference: "Mark 16:15" },
                ]
            }
        ]
    },
    {
        name: "John",
        abbreviation: "John",
        icon: "✝️",
        chapters: [
            {
                book: "John",
                chapter: 1,
                verses: [
                    { book: "John", chapter: 1, verse: 1, text: "In the beginning was the Word, and the Word was with God, and the Word was God.", reference: "John 1:1" },
                    { book: "John", chapter: 1, verse: 3, text: "All things were made through Him, and without Him was not any thing made that was made.", reference: "John 1:3" },
                    { book: "John", chapter: 1, verse: 4, text: "In Him was life, and the life was the light of men.", reference: "John 1:4" },
                    { book: "John", chapter: 1, verse: 5, text: "The light shines in the darkness, and the darkness has not overcome it.", reference: "John 1:5" },
                    { book: "John", chapter: 1, verse: 12, text: "But to all who did receive Him, who believed in His name, He gave the right to become children of God,", reference: "John 1:12" },
                    { book: "John", chapter: 1, verse: 14, text: "And the Word became flesh and dwelt among us, and we have seen His glory, glory as of the only Son from the Father, full of grace and truth.", reference: "John 1:14" },
                ]
            },
            {
                book: "John",
                chapter: 3,
                verses: [
                    { book: "John", chapter: 3, verse: 3, text: "Jesus answered him, Truly, truly, I say to you, unless one is born again he cannot see the kingdom of God.", reference: "John 3:3" },
                    { book: "John", chapter: 3, verse: 16, text: "For God so loved the world, that He gave His only Son, that whoever believes in Him should not perish but have eternal life.", reference: "John 3:16" },
                    { book: "John", chapter: 3, verse: 17, text: "For God did not send His Son into the world to condemn the world, but in order that the world might be saved through Him.", reference: "John 3:17" },
                    { book: "John", chapter: 3, verse: 30, text: "He must increase, but I must decrease.", reference: "John 3:30" },
                ]
            },
            {
                book: "John",
                chapter: 10,
                verses: [
                    { book: "John", chapter: 10, verse: 10, text: "The thief comes only to steal and kill and destroy. I came that they may have life and have it abundantly.", reference: "John 10:10" },
                    { book: "John", chapter: 10, verse: 11, text: "I am the good shepherd. The good shepherd lays down His life for the sheep.", reference: "John 10:11" },
                    { book: "John", chapter: 10, verse: 27, text: "My sheep hear my voice, and I know them, and they follow me.", reference: "John 10:27" },
                    { book: "John", chapter: 10, verse: 28, text: "I give them eternal life, and they will never perish, and no one will snatch them out of my hand.", reference: "John 10:28" },
                ]
            },
            {
                book: "John",
                chapter: 14,
                verses: [
                    { book: "John", chapter: 14, verse: 1, text: "Let not your hearts be troubled. Believe in God; believe also in me.", reference: "John 14:1" },
                    { book: "John", chapter: 14, verse: 2, text: "In my Father's house are many rooms. If it were not so, would I have told you that I go to prepare a place for you?", reference: "John 14:2" },
                    { book: "John", chapter: 14, verse: 6, text: "Jesus said to him, I am the way, and the truth, and the life. No one comes to the Father except through me.", reference: "John 14:6" },
                    { book: "John", chapter: 14, verse: 27, text: "Peace I leave with you; my peace I give to you. Not as the world gives do I give to you. Let not your hearts be troubled, neither let them be afraid.", reference: "John 14:27" },
                ]
            },
            {
                book: "John",
                chapter: 15,
                verses: [
                    { book: "John", chapter: 15, verse: 5, text: "I am the vine; you are the branches. Whoever abides in me and I in him, he it is that bears much fruit, for apart from me you can do nothing.", reference: "John 15:5" },
                    { book: "John", chapter: 15, verse: 12, text: "This is my commandment, that you love one another as I have loved you.", reference: "John 15:12" },
                    { book: "John", chapter: 15, verse: 13, text: "Greater love has no one than this, that someone lay down his life for his friends.", reference: "John 15:13" },
                ]
            }
        ]
    },
    {
        name: "Romans",
        abbreviation: "Rom",
        icon: "📜",
        chapters: [
            {
                book: "Romans",
                chapter: 3,
                verses: [
                    { book: "Romans", chapter: 3, verse: 23, text: "for all have sinned and fall short of the glory of God,", reference: "Romans 3:23" },
                    { book: "Romans", chapter: 3, verse: 24, text: "and are justified by His grace as a gift, through the redemption that is in Christ Jesus,", reference: "Romans 3:24" },
                ]
            },
            {
                book: "Romans",
                chapter: 5,
                verses: [
                    { book: "Romans", chapter: 5, verse: 1, text: "Therefore, since we have been justified by faith, we have peace with God through our Lord Jesus Christ.", reference: "Romans 5:1" },
                    { book: "Romans", chapter: 5, verse: 8, text: "but God shows His love for us in that while we were still sinners, Christ died for us.", reference: "Romans 5:8" },
                ]
            },
            {
                book: "Romans",
                chapter: 6,
                verses: [
                    { book: "Romans", chapter: 6, verse: 23, text: "For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord.", reference: "Romans 6:23" },
                ]
            },
            {
                book: "Romans",
                chapter: 8,
                verses: [
                    { book: "Romans", chapter: 8, verse: 1, text: "There is therefore now no condemnation for those who are in Christ Jesus.", reference: "Romans 8:1" },
                    { book: "Romans", chapter: 8, verse: 28, text: "And we know that for those who love God all things work together for good, for those who are called according to His purpose.", reference: "Romans 8:28" },
                    { book: "Romans", chapter: 8, verse: 31, text: "What then shall we say to these things? If God is for us, who can be against us?", reference: "Romans 8:31" },
                    { book: "Romans", chapter: 8, verse: 37, text: "No, in all these things we are more than conquerors through Him who loved us.", reference: "Romans 8:37" },
                    { book: "Romans", chapter: 8, verse: 38, text: "For I am sure that neither death nor life, nor angels nor rulers, nor things present nor things to come, nor powers,", reference: "Romans 8:38" },
                    { book: "Romans", chapter: 8, verse: 39, text: "nor height nor depth, nor anything else in all creation, will be able to separate us from the love of God in Christ Jesus our Lord.", reference: "Romans 8:39" },
                ]
            },
            {
                book: "Romans",
                chapter: 12,
                verses: [
                    { book: "Romans", chapter: 12, verse: 1, text: "I appeal to you therefore, brothers, by the mercies of God, to present your bodies as a living sacrifice, holy and acceptable to God, which is your spiritual worship.", reference: "Romans 12:1" },
                    { book: "Romans", chapter: 12, verse: 2, text: "Do not be conformed to this world, but be transformed by the renewal of your mind, that by testing you may discern what is the will of God, what is good and acceptable and perfect.", reference: "Romans 12:2" },
                ]
            }
        ]
    },
    {
        name: "1 Corinthians",
        abbreviation: "1 Cor",
        icon: "💌",
        chapters: [
            {
                book: "1 Corinthians",
                chapter: 10,
                verses: [
                    { book: "1 Corinthians", chapter: 10, verse: 13, text: "No temptation has overtaken you that is not common to man. God is faithful, and He will not let you be tempted beyond your ability, but with the temptation He will also provide the way of escape, that you may be able to endure it.", reference: "1 Corinthians 10:13" },
                ]
            },
            {
                book: "1 Corinthians",
                chapter: 13,
                verses: [
                    { book: "1 Corinthians", chapter: 13, verse: 4, text: "Love is patient and kind; love does not envy or boast; it is not arrogant", reference: "1 Corinthians 13:4" },
                    { book: "1 Corinthians", chapter: 13, verse: 5, text: "or rude. It does not insist on its own way; it is not irritable or resentful;", reference: "1 Corinthians 13:5" },
                    { book: "1 Corinthians", chapter: 13, verse: 6, text: "it does not rejoice at wrongdoing, but rejoices with the truth.", reference: "1 Corinthians 13:6" },
                    { book: "1 Corinthians", chapter: 13, verse: 7, text: "Love bears all things, believes all things, hopes all things, endures all things.", reference: "1 Corinthians 13:7" },
                    { book: "1 Corinthians", chapter: 13, verse: 8, text: "Love never ends. As for prophecies, they will pass away; as for tongues, they will cease; as for knowledge, it will pass away.", reference: "1 Corinthians 13:8" },
                    { book: "1 Corinthians", chapter: 13, verse: 13, text: "So now faith, hope, and love abide, these three; but the greatest of these is love.", reference: "1 Corinthians 13:13" },
                ]
            },
            {
                book: "1 Corinthians",
                chapter: 15,
                verses: [
                    { book: "1 Corinthians", chapter: 15, verse: 3, text: "For I delivered to you as of first importance what I also received: that Christ died for our sins in accordance with the Scriptures,", reference: "1 Corinthians 15:3" },
                    { book: "1 Corinthians", chapter: 15, verse: 4, text: "that He was buried, that He was raised on the third day in accordance with the Scriptures,", reference: "1 Corinthians 15:4" },
                    { book: "1 Corinthians", chapter: 15, verse: 57, text: "But thanks be to God, who gives us the victory through our Lord Jesus Christ.", reference: "1 Corinthians 15:57" },
                ]
            }
        ]
    },
    {
        name: "2 Corinthians",
        abbreviation: "2 Cor",
        icon: "💌",
        chapters: [
            {
                book: "2 Corinthians",
                chapter: 5,
                verses: [
                    { book: "2 Corinthians", chapter: 5, verse: 17, text: "Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come.", reference: "2 Corinthians 5:17" },
                ]
            },
            {
                book: "2 Corinthians",
                chapter: 12,
                verses: [
                    { book: "2 Corinthians", chapter: 12, verse: 9, text: "But He said to me, My grace is sufficient for you, for my power is made perfect in weakness. Therefore I will boast all the more gladly of my weaknesses, so that the power of Christ may rest upon me.", reference: "2 Corinthians 12:9" },
                ]
            }
        ]
    },
    {
        name: "Galatians",
        abbreviation: "Gal",
        icon: "🕊️",
        chapters: [
            {
                book: "Galatians",
                chapter: 2,
                verses: [
                    { book: "Galatians", chapter: 2, verse: 20, text: "I have been crucified with Christ. It is no longer I who live, but Christ who lives in me. And the life I now live in the flesh I live by faith in the Son of God, who loved me and gave himself for me.", reference: "Galatians 2:20" },
                ]
            },
            {
                book: "Galatians",
                chapter: 5,
                verses: [
                    { book: "Galatians", chapter: 5, verse: 1, text: "For freedom Christ has set us free; stand firm therefore, and do not submit again to a yoke of slavery.", reference: "Galatians 5:1" },
                    { book: "Galatians", chapter: 5, verse: 22, text: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness,", reference: "Galatians 5:22" },
                    { book: "Galatians", chapter: 5, verse: 23, text: "gentleness, self-control; against such things there is no law.", reference: "Galatians 5:23" },
                ]
            }
        ]
    },
    {
        name: "Ephesians",
        abbreviation: "Eph",
        icon: "⚔️",
        chapters: [
            {
                book: "Ephesians",
                chapter: 2,
                verses: [
                    { book: "Ephesians", chapter: 2, verse: 8, text: "For by grace you have been saved through faith. And this is not your own doing; it is the gift of God,", reference: "Ephesians 2:8" },
                    { book: "Ephesians", chapter: 2, verse: 9, text: "not a result of works, so that no one may boast.", reference: "Ephesians 2:9" },
                    { book: "Ephesians", chapter: 2, verse: 10, text: "For we are His workmanship, created in Christ Jesus for good works, which God prepared beforehand, that we should walk in them.", reference: "Ephesians 2:10" },
                ]
            },
            {
                book: "Ephesians",
                chapter: 6,
                verses: [
                    { book: "Ephesians", chapter: 6, verse: 10, text: "Finally, be strong in the Lord and in the strength of His might.", reference: "Ephesians 6:10" },
                    { book: "Ephesians", chapter: 6, verse: 11, text: "Put on the whole armor of God, that you may be able to stand against the schemes of the devil.", reference: "Ephesians 6:11" },
                    { book: "Ephesians", chapter: 6, verse: 12, text: "For we do not wrestle against flesh and blood, but against the rulers, against the authorities, against the cosmic powers over this present darkness, against the spiritual forces of evil in the heavenly places.", reference: "Ephesians 6:12" },
                ]
            }
        ]
    },
    {
        name: "Philippians",
        abbreviation: "Phil",
        icon: "😊",
        chapters: [
            {
                book: "Philippians",
                chapter: 1,
                verses: [
                    { book: "Philippians", chapter: 1, verse: 6, text: "And I am sure of this, that He who began a good work in you will bring it to completion at the day of Jesus Christ.", reference: "Philippians 1:6" },
                ]
            },
            {
                book: "Philippians",
                chapter: 4,
                verses: [
                    { book: "Philippians", chapter: 4, verse: 4, text: "Rejoice in the Lord always; again I will say, rejoice.", reference: "Philippians 4:4" },
                    { book: "Philippians", chapter: 4, verse: 6, text: "do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.", reference: "Philippians 4:6" },
                    { book: "Philippians", chapter: 4, verse: 7, text: "And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.", reference: "Philippians 4:7" },
                    { book: "Philippians", chapter: 4, verse: 8, text: "Finally, brothers, whatever is true, whatever is honorable, whatever is just, whatever is pure, whatever is lovely, whatever is commendable, if there is any excellence, if there is anything worthy of praise, think about these things.", reference: "Philippians 4:8" },
                    { book: "Philippians", chapter: 4, verse: 13, text: "I can do all things through Him who strengthens me.", reference: "Philippians 4:13" },
                ]
            }
        ]
    },
    {
        name: "Colossians",
        abbreviation: "Col",
        icon: "👑",
        chapters: [
            {
                book: "Colossians",
                chapter: 3,
                verses: [
                    { book: "Colossians", chapter: 3, verse: 2, text: "Set your minds on things that are above, not on things that are on earth.", reference: "Colossians 3:2" },
                    { book: "Colossians", chapter: 3, verse: 12, text: "Put on then, as God's chosen ones, holy and beloved, compassionate hearts, kindness, humility, meekness, and patience,", reference: "Colossians 3:12" },
                    { book: "Colossians", chapter: 3, verse: 13, text: "bearing with one another and, if one has a complaint against another, forgiving each other; as the Lord has forgiven you, so you also must forgive.", reference: "Colossians 3:13" },
                    { book: "Colossians", chapter: 3, verse: 23, text: "Whatever you do, work heartily, as for the Lord and not for men,", reference: "Colossians 3:23" },
                ]
            }
        ]
    },
    {
        name: "1 Thessalonians",
        abbreviation: "1 Thess",
        icon: "🙏",
        chapters: [
            {
                book: "1 Thessalonians",
                chapter: 5,
                verses: [
                    { book: "1 Thessalonians", chapter: 5, verse: 16, text: "Rejoice always,", reference: "1 Thessalonians 5:16" },
                    { book: "1 Thessalonians", chapter: 5, verse: 17, text: "pray without ceasing,", reference: "1 Thessalonians 5:17" },
                    { book: "1 Thessalonians", chapter: 5, verse: 18, text: "give thanks in all circumstances; for this is the will of God in Christ Jesus for you.", reference: "1 Thessalonians 5:18" },
                ]
            }
        ]
    },
    {
        name: "1 Timothy",
        abbreviation: "1 Tim",
        icon: "📖",
        chapters: [
            {
                book: "1 Timothy",
                chapter: 4,
                verses: [
                    { book: "1 Timothy", chapter: 4, verse: 12, text: "Let no one despise you for your youth, but set the believers an example in speech, in conduct, in love, in faith, in purity.", reference: "1 Timothy 4:12" },
                ]
            }
        ]
    },
    {
        name: "2 Timothy",
        abbreviation: "2 Tim",
        icon: "📖",
        chapters: [
            {
                book: "2 Timothy",
                chapter: 1,
                verses: [
                    { book: "2 Timothy", chapter: 1, verse: 7, text: "for God gave us a spirit not of fear but of power and love and self-control.", reference: "2 Timothy 1:7" },
                ]
            },
            {
                book: "2 Timothy",
                chapter: 3,
                verses: [
                    { book: "2 Timothy", chapter: 3, verse: 16, text: "All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness,", reference: "2 Timothy 3:16" },
                    { book: "2 Timothy", chapter: 3, verse: 17, text: "that the man of God may be complete, equipped for every good work.", reference: "2 Timothy 3:17" },
                ]
            }
        ]
    },
    {
        name: "Hebrews",
        abbreviation: "Heb",
        icon: "⚓",
        chapters: [
            {
                book: "Hebrews",
                chapter: 11,
                verses: [
                    { book: "Hebrews", chapter: 11, verse: 1, text: "Now faith is the assurance of things hoped for, the conviction of things not seen.", reference: "Hebrews 11:1" },
                ]
            },
            {
                book: "Hebrews",
                chapter: 12,
                verses: [
                    { book: "Hebrews", chapter: 12, verse: 1, text: "Therefore, since we are surrounded by so great a cloud of witnesses, let us also lay aside every weight, and sin which clings so closely, and let us run with endurance the race that is set before us,", reference: "Hebrews 12:1" },
                    { book: "Hebrews", chapter: 12, verse: 2, text: "looking to Jesus, the founder and perfecter of our faith, who for the joy that was set before Him endured the cross, despising the shame, and is seated at the right hand of the throne of God.", reference: "Hebrews 12:2" },
                ]
            },
            {
                book: "Hebrews",
                chapter: 13,
                verses: [
                    { book: "Hebrews", chapter: 13, verse: 5, text: "Keep your life free from love of money, and be content with what you have, for He has said, I will never leave you nor forsake you.", reference: "Hebrews 13:5" },
                    { book: "Hebrews", chapter: 13, verse: 8, text: "Jesus Christ is the same yesterday and today and forever.", reference: "Hebrews 13:8" },
                ]
            }
        ]
    },
    {
        name: "James",
        abbreviation: "Jas",
        icon: "💪",
        chapters: [
            {
                book: "James",
                chapter: 1,
                verses: [
                    { book: "James", chapter: 1, verse: 2, text: "Count it all joy, my brothers, when you meet trials of various kinds,", reference: "James 1:2" },
                    { book: "James", chapter: 1, verse: 3, text: "for you know that the testing of your faith produces steadfastness.", reference: "James 1:3" },
                    { book: "James", chapter: 1, verse: 5, text: "If any of you lacks wisdom, let him ask God, who gives generously to all without reproach, and it will be given him.", reference: "James 1:5" },
                    { book: "James", chapter: 1, verse: 12, text: "Blessed is the man who remains steadfast under trial, for when he has stood the test he will receive the crown of life, which God has promised to those who love him.", reference: "James 1:12" },
                ]
            }
        ]
    },
    {
        name: "1 Peter",
        abbreviation: "1 Pet",
        icon: "🪨",
        chapters: [
            {
                book: "1 Peter",
                chapter: 5,
                verses: [
                    { book: "1 Peter", chapter: 5, verse: 7, text: "casting all your anxieties on Him, because He cares for you.", reference: "1 Peter 5:7" },
                ]
            }
        ]
    },
    {
        name: "1 John",
        abbreviation: "1 John",
        icon: "❤️",
        chapters: [
            {
                book: "1 John",
                chapter: 1,
                verses: [
                    { book: "1 John", chapter: 1, verse: 9, text: "If we confess our sins, He is faithful and just to forgive us our sins and to cleanse us from all unrighteousness.", reference: "1 John 1:9" },
                ]
            },
            {
                book: "1 John",
                chapter: 3,
                verses: [
                    { book: "1 John", chapter: 3, verse: 1, text: "See what kind of love the Father has given to us, that we should be called children of God; and so we are. The reason why the world does not know us is that it did not know Him.", reference: "1 John 3:1" },
                ]
            },
            {
                book: "1 John",
                chapter: 4,
                verses: [
                    { book: "1 John", chapter: 4, verse: 7, text: "Beloved, let us love one another, for love is from God, and whoever loves has been born of God and knows God.", reference: "1 John 4:7" },
                    { book: "1 John", chapter: 4, verse: 8, text: "Anyone who does not love does not know God, because God is love.", reference: "1 John 4:8" },
                    { book: "1 John", chapter: 4, verse: 19, text: "We love because He first loved us.", reference: "1 John 4:19" },
                ]
            }
        ]
    },
    {
        name: "Revelation",
        abbreviation: "Rev",
        icon: "🌟",
        chapters: [
            {
                book: "Revelation",
                chapter: 21,
                verses: [
                    { book: "Revelation", chapter: 21, verse: 4, text: "He will wipe away every tear from their eyes, and death shall be no more, neither shall there be mourning, nor crying, nor pain anymore, for the former things have passed away.", reference: "Revelation 21:4" },
                ]
            }
        ]
    }
];

// Helper function to get all verses from a specific book and chapter
export function getVersesByBookAndChapter(bookName: string, chapterNumber: number): BibleVerse[] {
    const book = bibleBooks.find(b => b.name === bookName);
    if (!book) return [];

    const chapter = book.chapters.find(c => c.chapter === chapterNumber);
    return chapter ? chapter.verses : [];
}

// Helper function to get a random verse from a specific book and chapter
export function getRandomVerse(bookName: string, chapterNumber: number): BibleVerse | null {
    const verses = getVersesByBookAndChapter(bookName, chapterNumber);
    if (verses.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * verses.length);
    return verses[randomIndex];
}

// Helper function to get all available chapters for a book
export function getChaptersForBook(bookName: string): number[] {
    const book = bibleBooks.find(b => b.name === bookName);
    if (!book) return [];

    return book.chapters.map(c => c.chapter).sort((a, b) => a - b);
}
