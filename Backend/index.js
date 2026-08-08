function getUser() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: 1, name: "Sabi" });
    }, 1000);
  });
}

async function gettingUser(){
    try{
        const data = await getUser();
         
        console.log(`User : ${data.name}`);
        return data
        
    }
    catch(err){
console.log("Error Is : ",err);

    }
}

// gettingUser()

function getPosts(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 101, title: "JavaScript" },
        { id: 102, title: "Node.js" },
      ]);
    }, 1500);
  });
}

async function gettingPost() {
   try{
     const data = await getPosts();
   
    console.log(`First Post : ${data[0].title}`);
    
   }
  catch(err){
    console.log("Error is : ",err);
    
  }
}



function getComments(postId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        "Great Post!",
        "Very Helpful",
      ]);
    }, 1000);
  });
}

async function gettingComments() {
    try{
        const data = await getComments(101)
    console.log(data);
    }

    catch(err){
        console.log("error is :",err);
        
    }
    
}




async function main() {
gettingUser()    
gettingPost(user.id)

gettingComments()

}

main()