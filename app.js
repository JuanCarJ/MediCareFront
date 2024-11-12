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
      verificarEstadoActivo: true // Controla si `verificarMismoEstado` está activo o no
    };
  },
  methods: {
    async fetchCitas() {
      try {
        const response = await fetch("https://mocki.io/v1/27b55c6e-9eea-4491-a1d9-eae0b91076f7");
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
        const response = await fetch("https://mocki.io/v1/e4e717ca-1aae-455a-8570-98b4fd077276");
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
        const response = await fetch("https://bcc06ae3-d562-4911-add3-b7fa9c2b92df.mock.pstmn.io/api/v2/citas/actualizarRegistroEstadoCitaF", {
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
