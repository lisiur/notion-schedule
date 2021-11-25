const axios = require('axios').default
const moment = require('moment')
let { GaoDeWeatherCity, GaoDeWeatherKey, NotionAuthKey, NotionDBKey, Timezone, Force } = process.env
Timezone = Number(Timezone)

async function tryCreateToday() {
	try {
		if (!await checkTodayCreated()) {
			await createToday()
			console.log("今日已新建");
		} else {
			console.log("今日已存在");
		}
	} catch (err) {
		console.error(err);
	}
}

async function tryCreateThisWeek() {
	try {
		if (Force || isFirstDayOfWeek()) {
			if (!await checkThisWeekCreated()) {
				await createThisWeek()
				console.log("本周已新建");
			} else {
				console.log("本周已存在");
			}
		}
	} catch (err) {
		console.error(err);
	}
}

async function tryCreateThisMonth() {
	try {
		if (Force || isFirstDayOfMonth()) {
			if (!await checkThisMonthCreated()) {
				await createThisMonth()
				console.log("本月已新建");
			} else {
				console.log("本月已存在");
			}
		}
	} catch (err) {
		console.error(err);
	}
}

async function tryCreateThisYear() {
	try {
		if (Force || isFirstDayOfYear()) {
			if (!await checkThisYearCreated()) {
				await createThisYear()
				console.log("本年已新建");
			} else {
				console.log("本年已存在");
			}
		}
	} catch (err) {
		console.error(err);
	}
}

function notionHeaders() {
	return {
		"Authorization": `Bearer ${NotionAuthKey}`,
		"Content-Type": "application/json",
		"Notion-Version": "2021-08-16"
	}
}

async function checkTodayCreated() {
	const res = await axios.post('https://api.notion.com/v1/search', {
		query: todayTitle()
	}, {
		headers: notionHeaders()
	})
	const found = res.data.results?.filter(it => {
		return it.parent?.database_id === NotionDBKey && it.properties?.['类型']?.select?.name === '日记'
	})
	return found && found.length > 0
}

async function checkThisWeekCreated() {
	const res = await axios.post('https://api.notion.com/v1/search', {
		query: thisWeekTitle()
	}, {
		headers: notionHeaders()
	})
	const found = res.data.results?.filter(it => {
		return it.parent?.database_id === NotionDBKey && it.properties?.['类型']?.select?.name === '周记'
	})
	return found && found.length > 0
}

async function checkThisMonthCreated() {
	const res = await axios.post('https://api.notion.com/v1/search', {
		query: thisMonthTitle()
	}, {
		headers: notionHeaders()
	})
	const found = res.data.results?.filter(it => {
		return it.parent?.database_id === NotionDBKey && it.properties?.['类型']?.select?.name === '月记'
	})
	return found && found.length > 0
}

async function checkThisYearCreated() {
	const res = await axios.post('https://api.notion.com/v1/search', {
		query: thisYearTitle()
	}, {
		headers: notionHeaders()
	})
	const found = res.data.results?.filter(it => {
		return it.parent?.database_id === NotionDBKey && it.properties?.['类型']?.select?.name === '年记'
	})
	return found && found.length > 0
}

async function createToday() {
	const weatherIcon = await getTodayWeather()
	await axios.post('https://api.notion.com/v1/pages/', {
		parent: {
			database_id: NotionDBKey,
		},
		icon: {
			type: 'emoji',
			emoji: weatherIcon,
		},
		properties: {
			名称: {
				title: [{
					text: {
						content: todayTitle(),
					}
				}]
			},
			日期: {
				date: {
					start: todayTitle(),
				}
			},
			类型: {
				select: {
					name: '日记'
				}
			}
		}
	}, {
		headers: notionHeaders()
	})
}

async function createThisWeek() {
	await axios.post('https://api.notion.com/v1/pages/', {
		parent: {
			database_id: NotionDBKey,
		},
		icon: {
			type: 'emoji',
			emoji: '7️⃣',
		},
		properties: {
			名称: {
				title: [{
					text: {
						content: thisWeekTitle(),
					}
				}]
			},
			日期: {
				date: {
					start: todayTitle(),
				}
			},
			类型: {
				select: {
					name: '周记'
				}
			}
		}
	}, {
		headers: notionHeaders()
	})
}

async function createThisMonth() {
	await axios.post('https://api.notion.com/v1/pages/', {
		parent: {
			database_id: NotionDBKey,
		},
		icon: {
			type: 'emoji',
			emoji: '🈷️',
		},
		properties: {
			名称: {
				title: [{
					text: {
						content: thisMonthTitle(),
					}
				}]
			},
			日期: {
				date: {
					start: todayTitle(),
				}
			},
			类型: {
				select: {
					name: '月记'
				}
			}
		}
	}, {
		headers: notionHeaders()
	})
}

async function createThisYear() {
	await axios.post('https://api.notion.com/v1/pages/', {
		parent: {
			database_id: NotionDBKey,
		},
		icon: {
			type: 'emoji',
			emoji: '🌏',
		},
		properties: {
			名称: {
				title: [{
					text: {
						content: thisYearTitle(),
					}
				}]
			},
			日期: {
				date: {
					start: todayTitle(),
				}
			},
			类型: {
				select: {
					name: '年记'
				}
			}
		}
	}, {
		headers: notionHeaders()
	})
}

async function getTodayWeather() {
	const res = await axios.get(`https://restapi.amap.com/v3/weather/weatherInfo?city=${GaoDeWeatherCity}&key=${GaoDeWeatherKey}`)
	const w = res.data.lives?.[0].weather ?? '未知'
	if (w == '晴') {
		return '☀️'
	} else if (w == '晴间多云') {
		return '🌤️'
	} else if (w.includes('云')) {
		return '🌥️'
	} else if (w == '阴') {
		return '☁️'
	} else if (w.includes('雷') && w.includes('雨')) {
		return '⛈️'
	} else if (w.includes('雨')) {
		return '🌧️'
	} else if (w.includes('风')) {
		return '🌪️'
	} else if (w.includes('雪')) {
		return '🌨️'
	} else if (w.includes('雾') || w.includes('霾') || w.includes('尘')) {
		return '🌫️'
	} else {
		return '❔'
	}
}

function todayTitle() {
	return moment().utcOffset(Timezone).format('YYYY-MM-DD')
}

function thisWeekTitle() {
	const weekStart = moment().startOf('isoWeek').utcOffset(Timezone).format('YYYY-MM-DD')
	const weekEnd = moment().endOf('isoWeek').utcOffset(Timezone).format('YYYY-MM-DD')
	return `${weekStart} - ${weekEnd}`
}

function thisMonthTitle() {
	return moment().format("YYYY-MM")
}

function thisYearTitle() {
	return moment().format("YYYY")
}

function isFirstDayOfWeek() {
	return moment().utcOffset(Timezone).format('e') === '1'
}

function isFirstDayOfMonth() {
	return moment().utcOffset(Timezone).format('DD') === '01'
}

function isFirstDayOfYear() {
	return moment().utcOffset(Timezone).format('MM-DD') === '01-01'
}

module.exports = {
	tryCreateToday,
	tryCreateThisWeek,
	tryCreateThisMonth,
	tryCreateThisYear,
}