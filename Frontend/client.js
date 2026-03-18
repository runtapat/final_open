const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

const BASE_URL = "http://localhost:3000"; // โทรหา Backend พอร์ต 3000

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true })); // ขาดไม่ได้ ไว้อ่าน Form
// [หน้าแรก]
app.get('/', async (req, res) => {
    const response = await axios.get(`${BASE_URL}/books`);
    res.render('index', { books: response.data });
});

// [หน้า Report]
app.get('/report', async (req, res) => {
    const filterGenreId = req.query.genreId || ""; 
    
    let apiUrl = `${BASE_URL}/books`;
    if (filterGenreId !== "") {
        apiUrl += `?genreId=${filterGenreId}`; // แนบเงื่อนไขไปหา Backend
    }

    const books = await axios.get(apiUrl);
    const genres = await axios.get(`${BASE_URL}/genres`);

    res.render('report', { 
        books: books.data, 
        genres: genres.data, 
        selectedGenre: filterGenreId 
    });
});


// [เพิ่มข้อมูล]
app.get('/create', async (req, res) => {
    const authors = await axios.get(`${BASE_URL}/authors`);
    const genres = await axios.get(`${BASE_URL}/genres`);
    res.render('create', { authors: authors.data, genres: genres.data });
});

app.post('/create', async (req, res) => {
    await axios.post(`${BASE_URL}/books`, req.body); // โยน req.body ไปให้ Backend จัดการต่อ
    res.redirect('/');
});

// [แก้ไขข้อมูล]
app.get('/edit/:id', async (req, res) => {
    const book = await axios.get(`${BASE_URL}/books/${req.params.id}`);
    const authors = await axios.get(`${BASE_URL}/authors`);
    const genres = await axios.get(`${BASE_URL}/genres`);
    res.render('update', { book: book.data, authors: authors.data, genres: genres.data });
});

// 🌟 HTML ฟอร์มส่งมาเป็น POST เราต้องแปลงร่างเป็น axios.put เพื่อส่งไป Backend
app.post('/edit/:id', async (req, res) => {
    await axios.put(`${BASE_URL}/books/${req.params.id}`, req.body);
    res.redirect('/');
});

// [ลบข้อมูล]
app.get('/delete/:id', async (req, res) => {
    await axios.delete(`${BASE_URL}/books/${req.params.id}`);
    res.redirect('/');
});

app.get('/view/:id', async (req, res) => {
    const response = await axios.get(`${BASE_URL}/books/${req.params.id}`);
    res.render('view', { book: response.data });
});

app.listen(5000, () => console.log('🌐 http://localhost:5000'));