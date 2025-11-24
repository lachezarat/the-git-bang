const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../server/db/repositories.db');
const outputPath = path.resolve(__dirname, '../public/repositories_details.json');

try {
    const db = new Database(dbPath, { readonly: true });
    const repos = db.prepare('SELECT * FROM repositories').all();

    const formatted = repos.reduce((acc, repo) => {
        acc[repo.id] = {
            ...repo,
            topics: repo.topics ? repo.topics.split('|') : [],
            languages: repo.languages ? repo.languages.split('|') : []
        };
        return acc;
    }, {});

    fs.writeFileSync(outputPath, JSON.stringify(formatted, null, 2));
    console.log(`✅ Exported ${repos.length} repositories to ${outputPath}`);
    console.log(`📦 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);

    db.close();
} catch (error) {
    console.error('❌ Error exporting database:', error);
    process.exit(1);
}
