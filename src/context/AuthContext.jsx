import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hubLimit, setHubLimit] = useState(2); 

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        fetchUserSubscription(session.user.id);
      } else {
        const adminStored = localStorage.getItem("kyotsu_admin");
        if (adminStored === "true") {
           setUser({ email: "Admin", role: "super-admin", username: "Admin", plan_type: "Unlimited" });
           setHubLimit(999);
        } else {
           setUser(null);
           setHubLimit(2);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserSubscription = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('hub_limit, plan_type')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        setHubLimit(data.hub_limit);
        setUser(prev => prev ? { ...prev, plan_type: data.plan_type, hub_limit: data.hub_limit } : null);
      }
    } catch (e) {
      console.error("Erro ao buscar assinatura:", e.message);
    }
  };

  const login = async (email, password) => {
    try {
      if (email === "Admin" && password === "Freitas0507@@") {
        const adminData = { email: "Admin", role: "super-admin", username: "Admin", plan_type: "Unlimited" };
        setUser(adminData);
        setHubLimit(999);
        localStorage.setItem("kyotsu_admin", "true");
        return { success: true };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { success: false, message: error.message };
      return { success: true };
    } catch (error) {
      return { success: false, message: "Erro na autenticação." };
    }
  };

  const register = async (email, password, username, planType) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (error) return { success: false, message: error.message };

      const limits = { 'Plano I': 2, 'Plano II': 4, 'Plano III': 6 };
      await supabase.from('subscriptions').insert({
        user_id: data.user.id,
        plan_type: planType,
        hub_limit: limits[planType] || 2,
        status: 'active'
      });

      return { success: true };
    } catch (error) {
      return { success: false, message: "Erro no registro." };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("kyotsu_admin");
    setUser(null);
    setHubLimit(2);
  };

  const isAdminPortal = () => user?.role === "super-admin" || user?.email === "Admin" || localStorage.getItem("kyotsu_admin") === "true";

  const value = {
    user,
    loading,
    hubLimit,
    login,
    register,
    logout,
    isAdminPortal,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
