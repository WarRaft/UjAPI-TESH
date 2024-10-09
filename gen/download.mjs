import download from './utils/download.mjs'
import * as path from 'node:path'

download(
    'https://raw.githubusercontent.com/UnryzeC/UjAPI/main/uJAPIFiles/common.j',
    path.join('sdk', 'common.j'),
    true
)

download(
    'https://raw.githubusercontent.com/WarRaft/war3mpq/refs/heads/main/extract/Scripts/common.j',
    path.join('sdk', 'common.vanilla.j'),
    true
)
