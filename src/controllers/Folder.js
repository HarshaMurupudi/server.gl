import { error } from 'console';
import fs from 'fs';
const path = require('path');

const create = (dir, structure, cb = null) => {
  cb = (
    (cb) =>
    (...a) =>
      setTimeout(() => cb.apply(null, a))
  )(cb);
  const subdirs = Reflect.ownKeys(structure);

  if (subdirs.length) {
    const sub = subdirs[0];
    const pth = path.join(dir, sub);
    const subsub = structure[sub];
    const copy = Object.assign({}, structure);
    delete copy[sub];

    fs.mkdir(pth, (err) => {
      if (err) return cb(err);
      create(pth, subsub, (err) => {
        if (err) return cb(err);
        create(dir, copy, cb);
      });
    });
  } else {
    cb(null);
  }
};

class FolderController {
  async createJob(job) {
    var isWin = process.platform === 'win32';
    const filePath = isWin ? `\\\\gl-fs01\\GLIOrders\\` : `/Volumes/GLIOrders/`;
    const checkFilePath = isWin
      ? `\\\\gl-fs01\\GLIOrders\\${job}\\`
      : `/Volumes/GLIOrders/${job}/`;

    const structure = {
      [job]: {
        Contracts: {
          History: {},
        },
        Quality: {},
        Reports: {},
      },
    };

    if (!fs.existsSync(checkFilePath)) {
      await create(filePath, structure, (err) => {
        if (err) console.log(err);
        // else console.log("Success");
      });
    } else {
      throw new Error('Folder already exists');
    }
  }
  async createPart(partNumber) {
    var isWin = process.platform === 'win32';
    const filePath = isWin ? `\\\\gl-fs01\\GLIParts\\` : `/Volumes/GLIParts/`;
    const checkFilePath = isWin
      ? `\\\\gl-fs01\\GLIParts\\${partNumber}\\`
      : `/Volumes/GLIParts/${partNumber}/`;

    const structure = {
      [partNumber]: {
        Current: {
          Art: {
            Approval: {},
            Automation: {},
            Customer: {},
            Cutting: {
              Dies: {},
              Laser: {},
              'Delta Laser': {},
              Plotter: {},
            },
            Documents: {},
            Film: {
              Face: {},
              Circuit: {},
            },
            DTS: {
              Face: {},
              Circuit: {},
            },
            Ref: {},
          },
          Cutting: {
            Laser: {},
            Zund: {},
          },
          Prints: {
            Image: {},
          },
          Quality: {
            Inspection: {
              FAIR: {
                'CMM File': {},
                Reports: {},
              },
              Production: {},
            },
            Planning: {
              'Customer Requirements': {},
              'Internal Quality Control': {},
            },
            Returns: {},
          },
        },
      },
    };

    if (!fs.existsSync(checkFilePath)) {
      await create(filePath, structure, (err) => {
        if (err) {
          throw new Error('Error in creating folders');
        }
        //  else console.log("Success");
      });
    } else {
      throw new Error('Folder already exists');
    }
  }
}

module.exports = new FolderController();
