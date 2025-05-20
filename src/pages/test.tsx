const students = [
    { name: "Alice", score: 82, passed: true },
    { name: "Bob", score: 47, passed: false },
    { name: "Cathy", score: 91, passed: true },
    { name: "David", score: 68, passed: true },
    { name: "Eric", score: 55, passed: false },
];

const app = () => {
    // ขั้นตอนที่ 1: กรองเอาเฉพาะนักเรียนที่ผ่าน
    const passedStudents = students.filter(student => student.passed === true);

    // ขั้นตอนที่ 2: ดึงชื่อของนักเรียนที่ผ่านออกมา
    const passedNames = passedStudents.map(student => student.name);
    const passedscores = passedStudents.map(students => students.score);

    // ขั้นตอนที่ 3: สร้างข้อความคะแนนสำหรับทุกคน
    const scoreMessages = students.map(
        student => `${student.name} ได้คะแนน ${student.score} คะแนน`
    );
    const passstudentscore = [
        {
            passedNames:String,
            passedscores:String,
        }
    ]
    const listpassstudentscoretoObject = (passedNames,passedscores).map (passstudentscore);
    console.log(passedNames);   // ควรได้ ["Alice", "Cathy", "David"]
    console.log(scoreMessages); /* ควรได้ [
        "Alice ได้คะแนน 82 คะแนน",
        "Bob ได้คะแนน 47 คะแนน",
        "Cathy ได้คะแนน 91 คะแนน",
        "David ได้คะแนน 68 คะแนน",
        "Eric ได้คะแนน 55 คะแนน"
    ] */
};

export default app;
