import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import HomePage from './components/HomePage.jsx'
import CategoryPage from './components/CategoryPage.jsx'
import TopicPage from './components/TopicPage.jsx'
import NotFound from './components/NotFound.jsx'
import EffectivenessMatrix from './components/EffectivenessMatrix.jsx'
import SearchPage from './components/SearchPage.jsx'
import GlossaryPage from './components/GlossaryPage.jsx'

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/matrix" element={<EffectivenessMatrix />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/glossary" element={<GlossaryPage />} />
        <Route path="/:category" element={<CategoryPage />} />
        <Route path="/:category/:topic" element={<TopicPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
