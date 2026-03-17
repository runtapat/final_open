const express = require('express');
const Sequelize = require('sequelize');

// 🌟 1. ดึงไฟล์ข้อมูลดิบ (JSON) เข้ามาเก็บไว้ในตัวแปร rawData
const rawData = require('./data.json'); 

const app = express();
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// เชื่อมต่อฐานข้อมูล SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite', 
    storage: './bookstore.sqlite', 
    logging: false // ปิดข้อความรกๆ ใน Terminal
});

// สร้างโครงสร้าง 3 ตาราง
const Author = sequelize.define('author', { name: Sequelize.STRING });
const Genre = sequelize.define('genre', { name: Sequelize.STRING });
const Book = sequelize.define('book', { title: Sequelize.STRING, price: Sequelize.INTEGER });

// ผูกความสัมพันธ์
Book.belongsTo(Author);
Book.belongsTo(Genre);

// ==========================================
// 🌟 2. จุดเปลี่ยน JSON เป็น SQLite (ทำงานตอนเริ่มเซิร์ฟเวอร์)
// ==========================================
sequelize.sync({ force: true }).then(async () => {
    // ใช้คำสั่ง bulkCreate เพื่อเอา Array จากไฟล์ JSON ยัดลงตารางรวดเดียว!
    // ต้องเรียงลำดับ: สร้างตารางหลัก (Author, Genre) ก่อน แล้วค่อยสร้างตารางรอง (Book)
    
    await Author.bulkCreate(rawData.authors);
    await Genre.bulkCreate(rawData.categories);
    await Book.bulkCreate(rawData.books);
    
    console.log("✅ Backend: ดูดข้อมูลจาก JSON ลง SQLite เรียบร้อยแล้ว!");
});
// ==========================================

// --- API Routes ทั้งหมด ---

// [READ] ดึงหนังสือ (รองรับการกรองข้อมูล)
app.get('/books', async (req, res) => {
    let condition = {};
    if (req.query.genreId) {
        condition.genreId = req.query.genreId; 
    }
    const books = await Book.findAll({ where: condition, include: [Author, Genre] });
    res.json(books);
});

// [READ] ดึงข้อมูลย่อย
app.get('/authors', async (req, res) => res.json(await Author.findAll()));
app.get('/genres', async (req, res) => res.json(await Genre.findAll()));
app.get('/books/:id', async (req, res) => res.json(await Book.findByPk(req.params.id)));

// [CREATE] เพิ่มหนังสือ & รองรับชื่อผู้แต่งใหม่
app.post('/books', async (req, res) => {
    let data = req.body;
    
    if (data.newAuthorName && data.newAuthorName.trim() !== '') {
        const newAuthor = await Author.create({ name: data.newAuthorName });
        data.authorId = newAuthor.id;
    }

    await Book.create(data);
    res.send('Created');
});

// [UPDATE & DELETE] แก้ไขและลบ
app.put('/books/:id', async (req, res) => {
    await Book.update(req.body, { where: { id: req.params.id } });
    res.send('Updated');
});
app.delete('/books/:id', async (req, res) => {
    await Book.destroy({ where: { id: req.params.id } });
    res.send('Deleted');
});

app.listen(3000, () => console.log('🚀 Backend รันที่ Port 3000'));