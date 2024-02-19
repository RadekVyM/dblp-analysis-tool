'use server'
import 'server-only'
import { isNullOrWhiteSpace } from '@/utils/strings'
import { revalidatePath } from 'next/cache'
import { serverError, unpackDefaultError } from '@/utils/errors'
import { changePassword, changeUserInfo, deleteCurrentUser, signUp, signIn, signOut } from '.'
import { destroySession, updateSession } from './session'

export async function submitSignInForm(prevState: any, formData: FormData) {
    const email = formData.get('email')?.toString() || '';
    const password = formData.get('password')?.toString() || '';

    if (isNullOrWhiteSpace(email) || isNullOrWhiteSpace(password)) {
        revalidatePath('auth');
        return;
    }

    try {
        await signIn(email, password);
        revalidatePath('/', 'layout');
        return { success: true };
    }
    catch (e) {
        const handled = handleError(e)
        if (handled) {
            return handled;
        }
        return { error: 'Signing in was not successful.' };
    }
}
export async function submitSignOutForm(formData: FormData) {
    try {
        signOut();
        return { success: true };
    }
    catch (e) {
        const handled = handleError(e)
        if (handled) {
            return handled;
        }
        return { error: 'Signing out was not successful.' };
    }
}

export async function submitSignUpForm(prevState: any, formData: FormData) {
    const email = formData.get('email')?.toString() || '';
    const username = formData.get('username')?.toString() || '';
    const password = formData.get('password')?.toString() || '';
    const confirmPassword = formData.get('confirmPassword')?.toString() || '';

    if (isNullOrWhiteSpace(email) || isNullOrWhiteSpace(username) || isNullOrWhiteSpace(password) || isNullOrWhiteSpace(confirmPassword)) {
        revalidatePath('auth');
        return;
    }

    try {
        await signUp(email, username, password, confirmPassword);
        return { success: true };
    }
    catch (e) {
        const handled = handleError(e)
        if (handled) {
            return handled;
        }
        return { error: 'Registration was not successful.' };
    }
}

export async function submitChangeUserInfoForm(prevState: any, formData: FormData) {
    const email = formData.get('email')?.toString() || '';
    const username = formData.get('username')?.toString() || '';

    if (isNullOrWhiteSpace(email) || isNullOrWhiteSpace(username)) {
        revalidatePath('profile');
        return;
    }

    try {
        const user = await changeUserInfo(email, username);

        if (!user) {
            throw serverError('User information could not be updated');
        }

        revalidatePath('profile', 'layout');
        // Send the updated data back to the client to update the current session
        await updateSession(user.username, user.email);
        return { success: true };
    }
    catch (e) {
        const handled = handleError(e);
        if (handled) {
            return handled;
        }
    }

    revalidatePath('profile');
}

export async function submitChangePasswordForm(prevState: any, formData: FormData) {
    const currentPassword = formData.get('currentPassword')?.toString() || '';
    const newPassword = formData.get('newPassword')?.toString() || '';
    const confirmNewPassword = formData.get('confirmNewPassword')?.toString() || '';

    if (isNullOrWhiteSpace(currentPassword) || isNullOrWhiteSpace(newPassword) || isNullOrWhiteSpace(confirmNewPassword)) {
        revalidatePath('profile');
        return;
    }

    try {
        await changePassword(currentPassword, newPassword, confirmNewPassword);
        return { success: true };
    }
    catch (e) {
        const handled = handleError(e)
        if (handled) {
            return handled;
        }
    }

    revalidatePath('profile');
}

export async function submitDeleteAccountForm(prevState: any, formData: FormData) {
    try {
        await deleteCurrentUser();
        destroySession();
        revalidatePath('/', 'layout');
        return { success: true };
    }
    catch (e) {
        const handled = handleError(e)
        if (handled) {
            return handled;
        }
    }

    revalidatePath('profile');
}

function handleError(e: any) {
    if (e instanceof Error) {
        if (e instanceof TypeError) {
            return { error: 'Operation could not be finished.' };
        }

        const errorObject = unpackDefaultError(e);

        if (errorObject) {
            return { error: errorObject.message };
        }
    }
}