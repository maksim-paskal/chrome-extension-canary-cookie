const COOKIE_NAME = 'CanaryUser';
const COOKIE_VALUE = 'true';
const ICON_ON = {
  path: {
    '128': 'icon-on.png'
  },
};
const ICON_OFF = {
  path: {
    '128': 'icon-off.png'
  }
}

// Check if cookie is set, return true when cookie is set
const isCookieSet = async (url) => {
  const cookies = await chrome.cookies.getAll({ url: new URL(url).origin })

  let result = false

  cookies.forEach(cookie => {
    if (cookie.name === COOKIE_NAME && cookie.value === COOKIE_VALUE) {
      result = true
    }
  });

  return result
}

// Handle tab activation (switching tabs)
const tabActivated = async (tab) => {
  const tabInfo = await chrome.tabs.get(tab.tabId)

  if (await isCookieSet(tabInfo.url)) {
    await chrome.action.setIcon(ICON_ON)
  } else {
    await chrome.action.setIcon(ICON_OFF)
  }
}

// Handle icon click
const iconClicked = async (tab) => {
  if (await isCookieSet(tab.url)) {
    await chrome.cookies.remove({ url: tab.url, name: COOKIE_NAME })
    return await chrome.action.setIcon(ICON_OFF)
  } else {
    const today = new Date();

    await chrome.cookies.set({
      url: tab.url,
      domain: new URL(tab.url).hostname,
      name: COOKIE_NAME,
      value: COOKIE_VALUE,
      path: '/',
      expirationDate: today.getTime() + 1000 * 60 * 60 * 24 * 365,
    })
    return await chrome.action.setIcon(ICON_ON)
  }
}

// Handle tab activation (switching tabs)
chrome.tabs.onActivated.addListener(tabActivated);

// Handle icon click
chrome.action.onClicked.addListener(iconClicked);