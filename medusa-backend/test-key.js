const key = 'pk_e52ced3018a66c800e2eecd4be474add6ac3a05f68508761a5d5d01b623711fb';

fetch('http://127.0.0.1:9000/store/products', {
    headers: {
        'x-publishable-api-key': key
    }
})
    .then(async r => {
        console.log('Status:', r.status);
        const json = await r.json();
        console.log('Body:', JSON.stringify(json, null, 2));
    })
    .catch(console.error);
