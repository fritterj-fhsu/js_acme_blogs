function createElemWithText(elementName = "p", textContent = "", className){
    const result = document.createElement(elementName);
    result.textContent = textContent;
    if(className){result.className = className;}
    return result;
  }
  
  function createSelectOptions(usersData){
    if(!usersData){return undefined;}
    
    const resultArray = usersData.map(user =>{
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.name;
      return option;
    });
    
    return resultArray;
  }
  
  function toggleCommentSection(postId){
    if(!postId){return undefined;}
    
    const section = document.querySelector(`section[data-post-id="${postId}"]`);
    
    if(section){section.classList.toggle('hide');}
    
    return section;
  }
  
  function toggleCommentButton(postId){
    if(!postId){return undefined;}
  
    const button = document.querySelector(`button[data-post-id="${postId}"]`);
    
    if(button){
      button.textContent = button.textContent === 'Show Comments' ? 'Hide Comments' : 'Show Comments';
    }
    
    return button;
  }
  
  function deleteChildElements(parentElement){
    if (!(parentElement instanceof HTMLElement)) {return undefined;}
    
    let child = parentElement.lastElementChild;
    
    while(child){
      parentElement.removeChild(child);
      child = parentElement.lastElementChild;
    }
    
    return parentElement;
  }
  
  function addButtonListeners(){
    const buttons = document.querySelectorAll('main button');
    
    if(buttons.length > 0){
      buttons.forEach(button => {
        const postId = button.dataset.postId;
        
        if(postId){
          button.addEventListener('click', function(event){
            toggleComments(event, postId);
          });
        }
      });
    }
    
    return buttons;
  }
  
  function removeButtonListeners(){
    const buttons = document.querySelectorAll('main button');
    
    if(buttons.length > 0){
      buttons.forEach(button =>{
        const postId = button.dataset.postId;
        if(postId){
          button.removeEventListener('click',function(event){
            toggleComments(event, postId);
          });
        }
      });
    }
    
    return buttons;
  }
  
  function createComments(comments){
    if(!comments) return undefined;
    
    const fragment = document.createDocumentFragment();
  
    for(const comment of comments){
      const article = document.createElement('article');
      
      article.appendChild(createElemWithText('h3', comment.name));
      article.appendChild(createElemWithText('p', comment.body));
      article.appendChild(createElemWithText('p', `From: ${comment.email}`));
      
      fragment.appendChild(article);
    }
    
    return fragment;
  }
  
  function populateSelectMenu(users){
    if(!users) return undefined;
    
    const selectMenu = document.getElementById('selectMenu');
    const options = createSelectOptions(users);
    
    for(const option of options){
      selectMenu.appendChild(option);
    }
    
    return selectMenu;
  }
  
  async function getUsers() {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      return response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
  
  async function getUserPosts(userId) {
    if(!userId) return undefined;
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
      return response.json();
    } catch (error) {
      console.error(`Error fetching posts for user ${userId}:`, error);
      throw error;
    }
  }
  
  async function getUser(userId) {
    if(!userId) return undefined;
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
      return response.json();
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  }
  
  async function getPostComments(postId){
    if(!postId) return undefined;
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
      return response.json();
    } catch (error){
      console.error(`Error fetching comments for post ${postId}:`, error);
      throw error;
    }
  }
  
  async function displayComments(postId) {
    if(!postId) return undefined;
    const section = document.createElement('section');
    section.dataset.postId = postId;
    section.classList.add('comments', 'hide');
  
    try {
      const comments = await getPostComments(postId);
      const fragment = createComments(comments);
      section.appendChild(fragment);
    } catch (error) {
      console.error(`Error displaying comments for post ${postId}:`, error);
      throw error;
    }
  
    return section;
  }
  
  async function createPosts(posts) {
    if (!posts) return undefined;
  
    const fragment = document.createDocumentFragment();
  
    for (const post of posts) {
      const article = document.createElement('article');
  
      article.appendChild(createElemWithText('h2', post.title));
      article.appendChild(createElemWithText('p', post.body));
      article.appendChild(createElemWithText('p', `Post ID: ${post.id}`));
  
      try {
        const author = await getUser(post.userId);
        article.appendChild(
          createElemWithText(
            'p',
            `Author: ${author.name} with ${author.company.name}`
          )
        );
        article.appendChild(createElemWithText('p', author.company.catchPhrase));
      } catch (error) {
        console.error(`Error getting user for post ${post.id}:`, error);
        throw error;
      }
  
      const button = createElemWithText('button', 'Show Comments');
      button.dataset.postId = post.id;
      article.appendChild(button);
  
      try {
        const section = await displayComments(post.id);
        article.appendChild(section);
      } catch (error) {
        console.error(`Error displaying comments for post ${post.id}:`, error);
        throw error;
      }
  
      fragment.appendChild(article);
    }
  
    return fragment;
  }
  
  async function displayPosts(posts) {
    const mainElement = document.querySelector('main');
    const element =
      posts && posts.length > 0
        ? await createPosts(posts)
        : createElemWithText('p', 'Select an Employee to display their posts.', 'default-text');
  
    mainElement.appendChild(element);
  
    return element;
  }
  
  
  function toggleComments(event, postId) {
    if (!event || !postId) {
      return undefined;
    }
  
    event.target.listener = true;
  
    const section = toggleCommentSection(postId);
    const button = toggleCommentButton(postId);
  
    return [section, button];
  }
  
  async function refreshPosts(posts) {
    if(!posts) return undefined;
    const mainElement = document.querySelector('main');
  
    const removeButtons = removeButtonListeners();
    const main = deleteChildElements(mainElement);
    const fragment = await displayPosts(posts);
    const addButtons = addButtonListeners();
  
    return [removeButtons, main, fragment, addButtons];
  }
  
  async function selectMenuChangeEventHandler(event) {
    if (!event) {
      return undefined;
    }
  
    try {
      const selectMenu = document.getElementById('selectMenu');
      selectMenu.disabled = true;
  
      const userId = event?.target?.value || 1;
      const posts = await getUserPosts(userId);
      const refreshPostsArray = await refreshPosts(posts);
  
      selectMenu.disabled = false;
  
      return [userId, posts, refreshPostsArray];
    } catch (error) {
      console.error("An error occurred:", error);
      return [];
    }
  }
  
  async function initPage() {
    try {
      const users = await getUsers();
  
      const select = populateSelectMenu(users);
  
      return [users, select];
    } catch (error) {
      console.error("An error occurred:", error);
      return [];
    }
  }
  
  async function initApp() {
    try {
      const [users, select] = await initPage();
  
      const selectMenu = document.getElementById('selectMenu');
  
      selectMenu.addEventListener('change', selectMenuChangeEventHandler);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    initApp();
  });