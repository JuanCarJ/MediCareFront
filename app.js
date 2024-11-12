const { createApp } = Vue;

createApp({
  data() {
    return {
      citas: [],
      estados: [],
      selectedEstado: "",
      filteredCitas: [],
      selectedCita: null,
      nuevoEstado: null,
      mensaje: "",
      mostrarMensaje: false,
      verificarEstadoActivo: true // Controla si verificarMismoEstado está activo o no
    };
  },
  methods: {
    async fetchCitas() {
      try {
        const response = await fetch("http://localhost:8080/cita/obtener-citas");
        if (!response.ok) throw new Error("Error al cargar las citas");
        this.citas = await response.json();
        this.filteredCitas = this.citas;
      } catch (error) {
        console.error("Error fetching citas:", error);
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las citas. Intente nuevamente más tarde.'
        });
      }
    },
    async fetchEstados() {
      try {
        const response = await fetch("http://localhost:8080/tipo-estado-cita/obtener-tipos-estado-cita");
        if (!response.ok) throw new Error("Error al cargar los estados");
        this.estados = await response.json();
      } catch (error) {
        console.error("Error fetching estados:", error);
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los estados. Intente nuevamente más tarde.'
        });
      }
    },
    filterByEstado() {
      if (this.selectedEstado) {
        this.filteredCitas = this.citas.filter(cita => cita.estadoActual === this.selectedEstado);
      } else {
        this.filteredCitas = this.citas;
      }
    },
    openUpdateModal(cita) {
      this.selectedCita = cita;
      this.nuevoEstado = null;
      this.mensaje = "";
    },
    closeModal() {
      this.selectedCita = null;
    },
    verificarMismoEstado(activo) {
      this.verificarEstadoActivo = activo;
      if (this.verificarEstadoActivo && this.selectedCita && this.nuevoEstado) {
        const estadoActualId = this.estados.find(e => e.descripcion === this.selectedCita.estadoActual)?.id;
        if (estadoActualId === this.nuevoEstado) {
          swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'No se puede actualizar al mismo estado'
          });
          return false;
        }
      }
      return true;
    },
    async updateEstado() {
      if (!this.nuevoEstado) return;
      if (!this.verificarMismoEstado(this.verificarEstadoActivo)) {
        return; 
      }

      try {
        const response = await fetch("http://localhost:8080/registro-estado-cita/asignar-estado-cita", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idCita: this.selectedCita.id,
            idNuevoEstado: this.nuevoEstado
          })
        });

        const data = await response.json();
        this.mensaje = data.Mensaje;

        if (response.ok) {
          await this.fetchCitas(); // Recargar citas si la actualización fue exitosa
          swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: this.mensaje
          });
        } else {
          swal.fire({
            icon: 'error',
            title: 'Error',
            text: this.mensaje
          });
        }

        this.closeModal();
      } catch (error) {
        console.error("Error updating estado:", error);
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al actualizar el estado de la cita. Intente nuevamente más tarde.'
        });
      }
    }
  },
  async mounted() {
    await this.fetchCitas();
    await this.fetchEstados();
  }
}).mount("#app");
