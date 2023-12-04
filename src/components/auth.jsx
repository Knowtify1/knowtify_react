import { useState } from 'react';
import { auth, googleProvider } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, signOut} from 'firebase/auth';
import { Button, Checkbox, Form, Input } from 'antd';

export const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signIn = async () => {
        try{
            await createUserWithEmailAndPassword(auth, email, password);
        }catch (e){
            console.error(e);
        }
    };

    const signInWithGoogle = async () => {
        try{
            await signInWithPopup(auth, googleProvider);
        }catch (e){
            console.error(e);
        }
    };

    const logout = async () => {
        try{
            await signOut(auth);
        }catch (e){
            console.error(e);
        }
    };

    return(
        <div>
            <form onSubmit={onSubmit}>
                <input 
                type="email" 
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}/>
                <input
                type="password" 
                placeholder="Password" 
                onChange={(e) => setPassword(e.target.value)}/>
                <button onClick={signIn}>Sign In</button>

                
            </form>
            

            <button onClick={logout}>Logout</button>

        </div>
    )
}

async function onSubmit(){
    
}