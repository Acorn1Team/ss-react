// src/App.js
import React, { useState } from 'react';
import ProductList from './components/ProductList';

function App() {
    const [category, setCategory] = useState('');

    const categories = ['상의', '하의', '신발', '기타'];

    return (
        <div>
            <h1>Shopping Mall</h1>
            <div>
                {categories.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)}>
                        {cat}
                    </button>
                ))}
            </div>
            <ProductList category={category} />
        </div>
    );
}

export default App;
