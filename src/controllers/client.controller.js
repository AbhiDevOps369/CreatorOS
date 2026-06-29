import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from  "../utils/apiError.js";
import {ApiResponse} from  "../utils/apiResponse.js";
import {Client} from "../models/client.models.js";

const createClient=asyncHandler(async(req,res)=>{
    const {name,email,password}=req.body;

    const existingClient = await Client.findOne({ email })
    if (existingClient) {
        throw new ApiError(409, "Client with this email already exists")
    }

    const client=await Client.create({
        name,
        email,
        password,
        agencyId: req.user.agencyId
    });

    
    const createdClient = await Client.findById(client._id)
    .select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");

    if (!createdClient) {
    throw new ApiError(500, "Something went wrong while creating client")
    }

    return res.status(201).json(
    new ApiResponse(201, createdClient, "Client created successfully")
    );


}); 

const getAllClients=asyncHandler(async(req,res)=>{
    const agencyId=req.user.agencyId;
    //requireRole will prevent contributors or reviewers accessing this route


    const clients=await Client.find({agencyId:agencyId});

    return res.status(200).json(new ApiResponse(200,clients,"All Clients in your Agency"));
});

const getClientById=asyncHandler(async(req,res)=>{
    const clientId=req.params.clientId;
    if(!clientId){
        throw new ApiError(400,"Enter Client Id to get information");
    }

    const client=await Client.findById(clientId);
    if (!client) throw new ApiError(404, "Client not found")
    if(client.agencyId.toString() !== req.user.agencyId.toString()){
        throw new ApiError(403,"Access denied");
    }

    return res.status(200).json(new ApiResponse(200,client,"Client retrieved successfully"));
});

const updateClient=asyncHandler(async(req,res)=>{
    const { clientId } = req.params
    const { name, email, password } = req.body

    const client=await Client.findById(clientId);
    if (!client) throw new ApiError(404, "Client not found")
    if (client.agencyId.toString() !== req.user.agencyId.toString()) {
        throw new ApiError(403, "Access denied")
    }
    //hoping middleware validators wont allow non existing clients to controllers

    if(name){
        client.name=name;
    }
    if(email){
        client.email=email;
        client.isEmailVerified=false;
        
        const {unHashedToken,hashedToken,tokenExpiry}=client.generateTemporaryTokens();

        client.emailVerificationToken=hashedToken;
        client.emailVerificationExpiry=tokenExpiry;
    }
    if(password){
        client.password=password;
    }

    await client.save();
    const updatedClient = await Client.findById(clientId)
    .select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")
    return res.status(200).json(new ApiResponse(200,updatedClient,"Updated Client succesfully"));



});

const deleteClient=asyncHandler(async(req,res)=>{
    const {clientId}=req.params;

    const client = await Client.findById(clientId);

    if (!client) throw new ApiError(404, "Client not found");

    if (client.agencyId.toString() !== req.user.agencyId.toString()) {
        throw new ApiError(403, "Access denied")
    }

    await Client.findByIdAndDelete(clientId);

    return res.status(200).json(new ApiResponse(200,{},`Deleted Client with Client Id = ${clientId} successfully`));
});
export {createClient,getAllClients,getClientById,updateClient,deleteClient}