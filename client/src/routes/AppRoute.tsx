import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Login } from '@/core/Login';
import { PrivateRoute } from './PrivateRoute';
import { Chef } from '@/pages/Chef';
import { HeadChef } from '@/pages/HeadChef';
import { HealthSafetyOfficer } from '@/pages/HealthSafetyOfficer';
import { Delivery } from '@/pages/Delivery';


export const AppRoute: React.FC = () => {
    return (
        <>
            <Router>
                <Routes>
                    {/* route for login page */}
                    <Route index element={<Login />} />
                    <Route path="/login" element={<Login />} />


                    {/* route for chef page */}
                    <Route
                        path="/chef"
                        element={
                            <PrivateRoute>
                                <Chef />
                            </PrivateRoute>
                        }
                    />
                    {/* route for head chef page */}
                    <Route
                        path="/head_chef"
                        element={
                            <PrivateRoute>
                                <HeadChef />
                            </PrivateRoute>
                        }
                    />
                    {/* route for head chef page */}
                    <Route
                        path="/admin"
                        element={
                            <PrivateRoute>
                                <HeadChef />
                            </PrivateRoute>
                        }
                    />
                    {/* route for health safety officer page */}
                    <Route
                        path="/health_safety_officer"
                        element={
                            <PrivateRoute>
                                <HealthSafetyOfficer />
                            </PrivateRoute>
                        }
                    />
                    {/* route for delivery page */}
                    <Route
                        path="/delivery"
                        element={
                            <PrivateRoute>
                                <Delivery />
                            </PrivateRoute>
                        }
                    />

                </Routes>
            </Router>
        </>
    )
};