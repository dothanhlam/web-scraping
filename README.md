# MF lenses web-scraping

This script supports following site
1. m42lens.com - done
2. mfforum - in progress
3. xomnhiepanh - in progress
4. vnphoto - in progress

Available database
- m42lens-com.json - over 1600 lenses

## Usage
you need to install json-server for querying everything from json file

For your scraping purpose
m42lens.com 
This website currently supports 108 pages, you would to parse 10 pages a time
`app.batchParsing(1, 10); // parsing all lenses from page 1 - 10`

After finishing about 100 pages of parsing, you need to merge all of them

`app.filesProcess(1, 108, './m42lenses/lenses.json');`

For image downloading purpose
`app.batchDownloadImage([{url: '/images/lenses/1083/a_schacht_ulm_edixa-m-travenar-a_50mm_f2_8-22_m42_01.jpg',}]);`

Use with your own risk for licensing
