// TABS SECTION ~
const tabsTitle = document.querySelector('[data-tabs-btn]')
const tabsDisplay = document.querySelector('[data-tabs-list-display]')
const tabsContainer = document.querySelector('[data-tabs-container]')
const tabsTemplate = document.getElementById('tab-template')
const newTabForm = document.querySelector('[data-new-tab-form]')
const newTabInput = document.querySelector('[data-new-tab-input]')
const deleteTabBtn = document.querySelector('[data-tabs-delete]')
const tabsCountElement = document.querySelector('[data-tabs-count]')

// LISTS SECTION ~
const listContainer = document.querySelector('[data-lists]')
const newListForm = document.querySelector('[data-new-list-form]')
const newListInput = document.querySelector('[data-new-list-input]')
const deleteListBtn = document.querySelector('[data-delete-list]')

// TASKS SECTION ~
const listDisplay = document.querySelector('[data-tasks-list-display]')
const listTitle = document.querySelector('[data-list-title]')
const listCount = document.querySelector('[data-list-count]')
const tasksContainer = document.querySelector('[data-tasks-container]')
const taskTemplate = document.getElementById('task-template')
const newTaskForm = document.querySelector('[data-new-task-form]')
const newTaskInput = document.querySelector('[data-new-task-input]')
const clearCompletedTasks = document.querySelector('[data-clear-completed-tasks]')

// LOCAL STORAGE CREDENTIALS ~
const LOCAL_STORAGE_SAVED_TABS = 'saved.tabs.key293kei9'
const LOCAL_STORAGE_TAB_SELECTED = 'tab.selected.key93846'
const LOCAL_STORAGE_TABS_KEY = 'tabs.key.92uen58'
const LOCAL_STORAGE_LISTS_KEY = 'lists.key0398enx'
const LOCAL_STORAGE_SELECTED_LIST_KEY = 'selected.list.key928mei'

let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LISTS_KEY)) || []
let selectedListId = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_KEY))
let isTabSelected = JSON.parse(localStorage.getItem(LOCAL_STORAGE_TAB_SELECTED)) || false
let tabsList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_TABS_KEY)) || []

function render() {
    clearElement(listContainer)
    if (isTabSelected) {
        tabsTitle.classList.add('active')
    } else {
        tabsTitle.classList.remove('active')
    }
    renderLists()
    const selectedList = lists.find(list => list.id == selectedListId)
    if (selectedListId === null) {
        listDisplay.style.display = 'none'
        if (isTabSelected) {
            tabsDisplay.style.display = ''
            renderTabs()
        }
    } else {
        tabsDisplay.style.display = 'none'
        listDisplay.style.display = ''
        listTitle.innerHTML = selectedList.name
        renderTaskCount(selectedList)
        renderTasks(selectedList.tasks)
    }
}

function renderLists() {
    lists.forEach(list => {
        const listElement = document.createElement('li')
        listElement.dataset.listId = list.id
        listElement.classList.add('list-name')
        if (list.id == selectedListId) {
            listElement.classList.add('active-list')
        }
        listElement.innerText = list.name
        listContainer.appendChild(listElement)
    })
}

function renderTasks(tasks) {
    clearElement(tasksContainer)
    tasks.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true)
        const checkbox = taskElement.querySelector('input')
        checkbox.id = task.id
        checkbox.checked = task.isComplete
        const label = taskElement.querySelector('label')
        label.htmlFor = task.id
        label.append(task.name)
        tasksContainer.appendChild(taskElement)
    })
}

function renderTaskCount(list) {
    const incompleteTasks = list.tasks.filter(task => !task.isComplete).length
    listCount.innerText = `${incompleteTasks} ${incompleteTasks < 2 ? 'task' : 'tasks'} remaining`
}

function renderTabs() {
    clearElement(tabsContainer)
    tabsList.forEach(tab => {
        const tabElement = document.importNode(tabsTemplate.content, true)
        const input = tabElement.querySelector('input')
        const label = tabElement.querySelector('label')
        const link = tabElement.querySelector('a')
        link.href = tab.name
        input.id = tab.id
        input.checked = tab.isSelected
        label.htmlFor = tab.id
        link.href = tab.url
        link.innerText = tab.name
        tabsContainer.appendChild(tabElement)
    })
    renderTabsCount();
}

function renderTabsCount() {
    const count = tabsList.length
    tabsCountElement.innerText = `${count} ${count < 2 && count > 0 ? "tab": "tabs"} available`
}

function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }
}

listContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
        selectedListId = e.target.dataset.listId
        if (isTabSelected) {
            isTabSelected = false
        }
        saveAndRender()
    }
})

newListForm.addEventListener('submit', e => {
    e.preventDefault()
    const listName = newListInput.value
    if (listName === null || listName === '') return
    const list = createList(listName)
    lists.push(list)
    newListInput.value = null
    saveAndRender()
})

function createList(name) {
    return { id: Date.now().toString(), name, tasks: [] }
}

deleteListBtn.addEventListener('click', e => {
    lists = lists.filter(list => list.id !== selectedListId)
    selectedListId = null
    saveAndRender()
})

tasksContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'input') {
        const selectedList = lists.find(list => list.id == selectedListId)
        const task = selectedList.tasks.find(task => task.id == e.target.id)
        task.isComplete = e.target.checked
        save()
        renderTaskCount(selectedList)
    }
})

newTaskForm.addEventListener('submit', e => {
    e.preventDefault()
    const selectedList = lists.find(list => list.id == selectedListId)
    const taskName = newTaskInput.value
    if (taskName === null || taskName === '') return
    const task = createTask(taskName)
    selectedList.tasks.push(task)
    newTaskInput.value = null
    saveAndRender()
})

function createTask(name) {
    return { id: Date.now().toString(), name, isComplete: false }
}

clearCompletedTasks.addEventListener('click', e => {
    const selectedList = lists.find(list => list.id == selectedListId)
    selectedList.tasks = selectedList.tasks.filter(task => !task.isComplete)
    save()
    renderTasks(selectedList.tasks)
})

tabsTitle.addEventListener('click', e => {
    selectedListId = null
    isTabSelected = true
    saveAndRender()
})

tabsContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'input') {
        const tab = tabsList.find(tab => tab.id == e.target.id)
        tab.isSelected = e.target.checked
        save()
        renderTabs()
    }
})

newTabForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const tabName = newTabInput.value
    if (tabName === null || tabName === '') return
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    const tab = createTab(tabName, tabs[0].url)
    tabsList.push(tab)
    newTabInput.value = null
    save()
    renderTabs()
})

function createTab(name, link) {
    return { id: Date.now().toString(), name, url: link, isSelected: false }
}

deleteTabBtn.addEventListener('click', e => {
    tabsList = tabsList.filter(tab => !tab.isSelected)
    save()
    renderTabs()
})

function save() {
    localStorage.setItem(LOCAL_STORAGE_LISTS_KEY, JSON.stringify(lists))
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_KEY, JSON.stringify(selectedListId))
    localStorage.setItem(LOCAL_STORAGE_TAB_SELECTED, JSON.stringify(isTabSelected))
    localStorage.setItem(LOCAL_STORAGE_TABS_KEY, JSON.stringify(tabsList))
}

function saveAndRender() {
    save()
    render()
}

render()