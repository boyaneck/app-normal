const sanctionService = (user_id,duration,reason) => {

    const expired=new Date(Date.now()+duration*60*1000) 
    //DB에 insert



    return {
        "유저가 성공적으로 제재되었습니다✔️"}
module.exports = sanctionService;
