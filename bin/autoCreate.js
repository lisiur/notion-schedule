const {
	tryCreateToday, 
	tryCreateThisYear, 
	tryCreateThisWeek, 
	tryCreateThisMonth,
} = require('../lib')

;(async function() {
	await tryCreateToday()
	await tryCreateThisWeek()
	await tryCreateThisMonth()
	await tryCreateThisYear()
})()
