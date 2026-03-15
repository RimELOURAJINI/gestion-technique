const fs = require('fs');
const filePath = 'd:/pfe/frontend-app/src/assets/css/my-task.style.min.css';

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Exact strings to remove as seen in view_file
    const target1 = '@import url("../../../../../../css2");';
    const target2 = '@import url("../../../../../../ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");';
    const target3 = '@import url("../../../../../../npm/bootstrap-icons@1.3.0/font/bootstrap-icons.css");';

    if (content.includes(target1)) {
        content = content.replace(target1, '/* removed */');
        console.log('Removed target1');
    }
    if (content.includes(target2)) {
        content = content.replace(target2, '/* removed */');
        console.log('Removed target2');
    }
    if (content.includes(target3)) {
        content = content.replace(target3, '/* removed */');
        console.log('Removed target3');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully wrote updated CSS');
} catch (err) {
    console.error('Error fixing CSS:', err);
    process.exit(1);
}
