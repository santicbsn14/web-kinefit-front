import { useEffect, useState, useCallback } from 'react'
import './patients.css'
import { toast } from 'react-toastify'
import api from '../../../../Services/api'
import { IPatient } from '../../../../Utils/Types/userTypes'
import { IUser } from '../../../../Utils/Types/userTypes'

const Patients = () => {
  const [patients, setPatients] = useState<IPatient[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPatient, setEditingPatient] = useState<IPatient | null>(null)
  const [medicalHistory, setMedicalHistory] = useState('')

  const fetchPatients = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const response = await api.get('/patients', { params: { page, limit: 10 } })
      setPatients(response.data.docs)
      setTotalPages(response.data.totalPages)
      setCurrentPage(page)
    } catch {
      toast.error('Error al cargar los pacientes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPatients(1) }, [fetchPatients])

  const getUser = (patient: IPatient): IUser | null => {
    if (typeof patient.userId === 'object') return patient.userId as IUser
    return null
  }

  const handleEditClick = (patient: IPatient) => {
    setEditingPatient(patient)
    setMedicalHistory(patient.medicalHistory || '')
    setShowEditModal(true)
  }

  const handleEditSave = async () => {
    if (!editingPatient) return
    try {
      await api.put(`/patients/${editingPatient._id}`, { medicalHistory })
      toast.success('Historia clínica actualizada')
      setShowEditModal(false)
      fetchPatients(currentPage)
    } catch {
      toast.error('Error al actualizar la historia clínica')
    }
  }

  if (loading) return <div>Cargando...</div>

  return (
    <div className="patientTableContainer">
      <div className="table-wrap">
        <table className="patientTable">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Historia clínica</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr><td colSpan={6}>No hay pacientes registrados</td></tr>
            ) : (
              patients.map((patient) => {
                const user = getUser(patient)
                return (
                  <tr key={patient._id}>
                    <td>{user?.name || 'N/A'}</td>
                    <td>{user?.email || 'N/A'}</td>
                    <td>{patient.dni}</td>
                    <td>{patient.phone}</td>
                    <td className="cell-medical">
                      {patient.medicalHistory
                        ? patient.medicalHistory.substring(0, 60) + (patient.medicalHistory.length > 60 ? '...' : '')
                        : <span className="no-data">Sin datos</span>}
                    </td>
                    <td>
                      <button
                        className="btn-ico btn-warning"
                        title="Editar historia clínica"
                        onClick={() => handleEditClick(patient)}
                      >
                        <i className="fa-solid fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="pagination">
        <button
          className="paginationButton"
          onClick={() => fetchPatients(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span className="pageInfo">Página {currentPage} de {totalPages}</span>
        <button
          className="paginationButton"
          onClick={() => fetchPatients(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>

      {/* Modal editar historia clínica */}
      {showEditModal && editingPatient && (
        <div className="modal-two">
          <div className="modalContent-two">
            <h2>Historia clínica — {getUser(editingPatient)?.name}</h2>
            <textarea
              className="medical-textarea"
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder="Ingresá los datos clínicos del paciente..."
              rows={6}
            />
            <div className="modalButtons-two">
              <button onClick={() => setShowEditModal(false)}>Cancelar</button>
              <button onClick={handleEditSave}>Guardar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Patients