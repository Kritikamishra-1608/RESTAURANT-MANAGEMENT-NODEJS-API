const Dish= require('../models/dish');

class DishService{

    async create(data){
        try{
            const dishName=data.dishName;
            const existingDish=await Dish.findOne({
                dishName: { $regex: new RegExp('^' + dishName + '$' , 'i') }
            });
            if(existingDish){
                throw{
                    message: "Dish already exist", existingDish
                };
            }
            const result = await Dish.create(data);
            return result;
        }catch(error){
            console.log("Something went wrong in the dish service layer");
            throw {error};
        }
    }

    async destroy(dishName){
        try{
            const deletedDish=await Dish.findOneAndDelete({
                dishName: { $regex: new RegExp('^' + dishName + '$' , 'i') }
            });
            if(!deletedDish){
                throw{
                    message:"Dish not found"
                }
            }
            return deletedDish;
        }catch(error){
            console.log("Something went wrong in the dish service layer");
            throw {error};
        }
    }

    async getAll(){
        try{
            const dishes= await Dish.find({});
            return dishes;
        }catch(error){
            console.log("Something went wrong in the dish service layer");
            throw {error};
        }
    }

    async update(data){
        try{
            const dishName= data.dishName;
            const existingDish= await Dish.findOne({
                dishName: { $regex: new RegExp('^' + dishName + '$', 'i') }
            });
            if(!existingDish){
                throw{
                    message: "Dish not found"
                }
            }

            existingDish.availableQuantity+=Number(data.quantity);
            existingDish.pricePerItem= data.price;
            const updatedDish= await existingDish.save();
            return updatedDish;

        }catch(error){
            console.log("Something went wrong in the dish service layer");
            throw {error};
        }
    }

    async get(dishName){
        try{
            const fetchedDish=await Dish.findOne({
                dishName: { $regex: new RegExp('^' + dishName + '$' , 'i') }
            });
            if(!fetchedDish){
                throw{
                    message:"Dish not found"
                }
            }
            return fetchedDish;
        }catch(error){
            console.log("Something went wrong in the dish service layer");
            throw {error};
        }
    }

    async getById(id){
        try{
            const fetchedDish=await Dish.findById(id)
            if(!fetchedDish){
                throw{
                    message:"Dish not found"
                }
            }
            return fetchedDish;
        }catch(error){
            console.log("Something went wrong in the dish service layer");
            throw {error};
        }
    }


    async purchase(amountPaid, orderedDishesArray) {
        try {
            let amountToBePaid = 0, change = 0;
            const notAvailableDishes=[];
            // so that all the promises in the map can complete
            await Promise.all(orderedDishesArray.map(async (dishObj) => {
                const dbDishObj = await Dish.findOne({
                    dishName: { $regex: new RegExp('^' + dishObj.dishName + '$', 'i') }
                });
                if (!dbDishObj || dbDishObj.availableQuantity < dishObj.quantity) {
                    notAvailableDishes.push(dishObj.dishName);
                }else{
                    amountToBePaid+=(dbDishObj.pricePerItem * dishObj.quantity);
                }
            }));
            if(notAvailableDishes.length==0)
            {
                if(amountPaid<amountToBePaid) {
                    throw {
                        message: `Paid amount is less than total amount required which is Rs.${amountToBePaid}, please pay Rs.${amountToBePaid - amountPaid} more to complete the transaction.`
                    };
                }else if(amountPaid >= amountToBePaid) {
                    change=amountPaid-amountToBePaid;
        
                    // Use Promise.all again to wait for all promises in the second map to complete
                    await Promise.all(orderedDishesArray.map(async (dishObj) => {
                        const dbDishObj = await Dish.findOne({
                            dishName: { $regex: new RegExp('^' + dishObj.dishName + '$', 'i') }
                        });
                        dbDishObj.availableQuantity-=dishObj.quantity;
                        if (dbDishObj.availableQuantity == 0) {
                            this.destroy(dbDishObj.dishName);
                        } else {
                            dbDishObj.save();
                        }
                    }));
                    return { change, amountToBePaid };
                }
            }else{
                throw{
                    message: `Requested quantity for dishes: ${notAvailableDishes} not available`
                }
            }
            
    
        } catch (error) {
            console.log("Something went wrong in the dish service layer");
            throw { error };
        }
    }
    
}

module.exports=DishService;























































// const DishRepository= require('../repository/dishRepository');

// class DishService{
//     constructor(){
//         this.dishRepository= new DishRepository();
//     }

//     async create(data){
//         try{
//             const dish= await this.dishRepository.create(data);
//             return dish;
//         }catch(error){
//             console.log("Something went wrong in the service layer");
//             throw {error}
//         }
//     }

//     async destroy(dishName){
//         try{
//             const deletedDish= await this.dishRepository.destroy(dishName);
//             return deletedDish;
//         }catch(error){
//             console.log("Something went wrong in the service layer");
//             throw {error}
//         }
//     }

//     async getAll(){
//         try{
//             const dishes= await this.dishRepository.getAll();
//             return dishes;
//         }catch(error){
//             console.log("Something went wrong in the service layer");
//             throw {error}
//         }
//     }

//     async update(data){
//         try{
//             const updatedDish= await this.dishRepository.update(data);
//             return updatedDish;
//         }catch(error){
//             console.log("Something went wrong in the service layer");
//             throw {error}
//         }
//     }

//     async get(dishName){
//         try{
//             const fetchedDish= await this.dishRepository.get(dishName);
//             return fetchedDish;
//         }catch(error){
//             console.log("Something went wrong in the service layer");
//             throw {error}
//         }
//     }

//     async purchase(amountPaid, orderedDishesArray){
//         try{
//             const transactionObj= await this.dishRepository.purchase(amountPaid, orderedDishesArray);
//             return transactionObj;
//         }catch(error){
//             console.log("Something went wrong in the service layer");
//             throw {error}
//         }
//     }
// }

// module.exports=DishService;