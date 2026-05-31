import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// We mock the localstorage logic that AuthContext does
describe('Auth Flow simulation', () => {
  beforeEach(() => {
    localStorage.clear();
    const mockUsers = [
      { uid: "1", email: "student@sfm.com", password: "student123", role: "student" },
      { uid: "2", email: "admin@sfm.com", password: "admin123", role: "admin" }
    ];
    localStorage.setItem("users", JSON.stringify(mockUsers));
  });

  const signInMock = async (email: string, password?: string) => {
    const usersStr = localStorage.getItem('users');
    if (!usersStr) throw new Error("No users found");
    const users = JSON.parse(usersStr);
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid email or password");
    localStorage.setItem('sfm_session', JSON.stringify(user));
    return user;
  };

  const signOutMock = async () => {
    localStorage.removeItem('sfm_session');
  };

  it('login with correct credentials succeeds', async () => {
    const user = await signInMock('student@sfm.com', 'student123');
    expect(user.uid).toBe("1");
    expect(user.role).toBe("student");
    expect(localStorage.getItem('sfm_session')).toContain('student@sfm.com');
  });

  it('login with wrong credentials throws error', async () => {
    await expect(signInMock('student@sfm.com', 'wrongpassword')).rejects.toThrow("Invalid email or password");
    expect(localStorage.getItem('sfm_session')).toBeNull();
  });

  it('logout clears session', async () => {
    await signInMock('admin@sfm.com', 'admin123');
    expect(localStorage.getItem('sfm_session')).not.toBeNull();

    await signOutMock();
    expect(localStorage.getItem('sfm_session')).toBeNull();
  });
});
