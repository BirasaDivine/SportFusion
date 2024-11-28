const testdat = async()=>{
    const url = 'http://api.football-data.org/v4/competitions/2021/matches';
const options = {
	method: 'GET',
	headers: {
		'x-auth-token': '2f648a8656184d4e867e5d8152a9427f',
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
} catch (error) {
	console.error(error);
}
}
testdat()