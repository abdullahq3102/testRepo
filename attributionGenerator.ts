import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface OwnerInfo {
  filepath: string;
  owner: string;
}

const directoryPath = process.cwd();

function findOwners(dir: string, currentOwner: string | null = null): OwnerInfo[] {
  let owners: OwnerInfo[] = [];
  const filesAndDirs = fs.readdirSync(dir);

  for (const name of filesAndDirs) {
    const fullPath = path.join(dir, name);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      let newOwner = currentOwner;
      const pomPath = path.join(fullPath, 'pom.yml');

      if (fs.existsSync(pomPath)) {
        try {
          const pomContent = yaml.load(fs.readFileSync(pomPath, 'utf8')) as any;
          if (pomContent && pomContent.owner) {
            newOwner = pomContent.owner;
          }
        } catch (error) {
          console.error(`Error reading ${pomPath}:`, error);
        }
      }

      // Record the directory and its owner, whether inherited or defined
      owners.push({ filepath: fullPath, owner: newOwner || "UNKNOWN" }); // Replace "UNKNOWN" with any default owner name you prefer

      // Recursively find owners for subdirectories
      owners = [...owners, ...findOwners(fullPath, newOwner)];
    }
  }

  return owners;
}

const ownersList = findOwners(directoryPath);
const jsonContent = JSON.stringify(ownersList, null, 3);

fs.writeFileSync('owners.json', jsonContent);

console.log("OwnersFile has been created!");