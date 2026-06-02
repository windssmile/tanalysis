import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import HomePage from './components/HomePage.jsx'
import CategoryPage from './components/CategoryPage.jsx'
import TopicPage from './components/TopicPage.jsx'
import NotFound from './components/NotFound.jsx'
import EffectivenessMatrix from './components/EffectivenessMatrix.jsx'

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/matrix" element={<EffectivenessMatrix />} />
        <Route path="/:category" element={<CategoryPage />} />
        <Route path="/:category/:topic" element={<TopicPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
