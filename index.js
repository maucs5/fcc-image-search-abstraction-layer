var express = require('express');
var app = express();

var flickr_api = process.env.FLICKR_API;

var most_recent = []; // maximum 10 recent. if 10, pop then unshift

app.get('/api/imagesearch/:search', (req, res) => {
    var search = req.params.search;
    var offset = req.query.offset;

    var offset_query;
    if (offset) offset_query = '&page=' + (parseInt(offset)+1);
    else offset_query = '';

    var api_url = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + flickr_api + '&text=' + search + '&per_page=10' + offset_query;

    var data = '';
    require('https').request(api_url, (resp) => {
	resp.on('data', (c) => {
	    data += c;
	});
	resp.on('end', () => {
	    require('xml2js').parseString(data, (err, result) => {
		var list = result.rsp.photos[0].photo;
		list = list.map((v) => {
		    v = v['$'];
		    return {
			url: 'farm'+v.farm+'.staticflickr.com/'+v.server+'/'+v.id+'_'+v.secret+'.jpg',
			title: v.title
		    };
		});

		if (most_recent.length === 10) most_recent.pop();
		most_recent.unshift({term: search, when: new Date().toISOString()});

		res.send(list);
	    });
	});
    }).end();
});

app.get('/api/latest/imagesearch/', (req, res) => {
    res.send(most_recent);
});

app.listen(process.env.PORT || 8000);
