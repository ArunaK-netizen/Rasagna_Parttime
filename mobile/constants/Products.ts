export const PRODUCTS = {
    snacks: [
        { name: 'Coolers', price: 12.00 },
        { name: 'Cashews', price: 2.75 },
        { name: 'Peanuts', price: 1.50 },
        { name: 'Crackers', price: 2.75 },
        { name: 'Candy', price: 2.50 },
        { name: 'Trail Mix', price: 3.00 },
        { name: 'Granola Bar', price: 2.50 },
        { name: 'Protein Bar', price: 3.25 },
        { name: 'Chips', price: 3.25 },
        { name: 'Pistachios', price: 2.75 }
    ],
    beverages: [
        { name: 'Juice', price: 4.25 },
        { name: 'Soda', price: 3.50 },
        { name: 'Water', price: 3.50 },
        { name: 'Gatorade', price: 4.25 },
        { name: 'Energy Drink', price: 3.50 }
    ],
    beer: [
        { name: 'Budweiser', price: 5.75 },
        { name: 'Bud Light', price: 5.75 },
        { name: 'Coor\'s Light', price: 5.75 },
        { name: 'Miller Lite', price: 5.75 },
        { name: 'Yuengling', price: 5.75 },
        { name: 'Mich Ultra', price: 5.75 },
        { name: 'Heineken', price: 6.50 },
        { name: 'Whiteclaw', price: 5.75 },
        { name: 'Arnold Palmer', price: 5.75 },
        { name: 'Stella', price: 6.50 },
        { name: 'Corona', price: 6.50 },
        { name: 'Guinness', price: 6.50 },
        { name: 'Flying Dog (Snake Dog)', price: 6.50 },
        { name: 'Mully\'s', price: 6.50 },
        { name: 'Terrapin', price: 6.50 },
        { name: 'Summer Shandy', price: 6.50 },
        { name: 'Domestic 6-pack', price: 24.00 },
        { name: 'Imported 6-pack', price: 30.00 },
        { name: 'Bluemoon', price: 6.50 },
        { name: 'Cutwater', price: 8.00 },
        { name: 'Dogfish (60 Minute)', price: 6.50 },
        { name: 'Dogfish (Cocktail)', price: 7.50 },
        { name: 'Highnoon', price: 8.00 },
        { name: 'Nutrl', price: 8.00 },
        { name: 'Orange Smash', price: 8.00 },
        { name: 'Testudo', price: 6.50 },
        { name: 'Truly', price: 5.75 },
    ],
    spirits: [
        { name: 'Jack Daniels', price: 8.50 },
        { name: 'Fireball Mini', price: 8.50 },
        { name: 'Jameson', price: 8.50 },
        { name: 'Bailey\'s', price: 8.50 },
        { name: 'Liquor and Mixer', price: 10.00 },
        { name: 'Rum', price: 8.50 },
        { name: 'Tequilla', price: 8.50 },
        { name: 'Vodka', price: 8.50 },
    ],

};

export type Category = keyof typeof PRODUCTS;
export type Product = { name: string; price: number };
